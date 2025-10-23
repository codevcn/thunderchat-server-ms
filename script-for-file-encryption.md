# Kịch bản mã hóa E2E cho File trong ứng dụng nhắn tin

## 1. Vấn đề với quy trình hiện tại

```
Quy trình hiện tại (KHÔNG an toàn):
User chọn file → Gửi plaintext file → Server → S3 → URL
                                        ↓
                                   Server thấy nội dung file!
                                   S3 lưu plaintext file!
                                   Anyone có URL → Xem được file!
```

## 2. Quy trình E2E mã hóa file (Cải tiến)

### Phương án 1: Mã hóa trước khi upload (KHUYẾN NGHỊ)

```
User chọn file → Mã hóa trên client → Upload encrypted file → S3
                      ↓
                 File encryption key
                      ↓
                 Mã hóa key bằng recipient's public key
                      ↓
                 Gửi encrypted key qua tin nhắn
                      ↓
                 Recipient giải mã key → Download encrypted file → Giải mã
```

### Phương án 2: Hybrid với signed URL (Cân bằng)

```
User chọn file → Mã hóa metadata → Upload plaintext → S3 private
                                                        ↓
                                                   Signed URL (expire)
                      ↓
                 Gửi signed URL + encrypted metadata
                      ↓
                 Recipient decrypt metadata → Download → Display
```

## 3. Kịch bản chi tiết - Phương án 1 (E2E thuần túy)

### 3.1. Chuẩn bị

```typescript
// Constants
const FILE_CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks
const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB limit

// File types
enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  AUDIO = "audio",
  OTHER = "other",
}
```

### 3.2. Gửi file có mã hóa

```typescript
BƯỚC 1: User chọn file
├─ User click attach button
├─ File input triggered
└─ User chọn file: "vacation.jpg" (5MB)

BƯỚC 2: Đọc và validate file
async function handleFileSelect(file: File) {
  // Validate
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File quá lớn');
  }

  // Đọc file
  const fileBuffer = await file.arrayBuffer();
  const fileType = detectFileType(file);

  // Generate thumbnail (nếu là ảnh/video)
  let thumbnail = null;
  if (fileType === FileType.IMAGE) {
    thumbnail = await generateImageThumbnail(file);
  } else if (fileType === FileType.VIDEO) {
    thumbnail = await generateVideoThumbnail(file);
  }

  return { fileBuffer, fileType, thumbnail, fileName: file.name };
}

BƯỚC 3: Mã hóa file
async function encryptFile(fileBuffer: ArrayBuffer) {
  // 3a. Sinh symmetric key cho file này
  const fileEncryptionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // 3b. Sinh IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3c. Mã hóa file content
  const encryptedFileBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    fileEncryptionKey,
    fileBuffer
  );

  // 3d. Export file encryption key để gửi cho recipient
  const exportedKey = await crypto.subtle.exportKey(
    'raw',
    fileEncryptionKey
  );

  return {
    encryptedFile: encryptedFileBuffer,
    fileKey: exportedKey, // Raw key bytes
    iv: iv
  };
}

BƯỚC 4: Mã hóa thumbnail (nếu có)
async function encryptThumbnail(thumbnailBlob: Blob, fileKey: ArrayBuffer) {
  const thumbnailBuffer = await thumbnailBlob.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Import lại key để dùng
  const key = await crypto.subtle.importKey(
    'raw',
    fileKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encryptedThumbnail = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    thumbnailBuffer
  );

  return { encryptedThumbnail, thumbnailIv: iv };
}

BƯỚC 5: Upload encrypted file lên S3
async function uploadEncryptedFile(
  encryptedFile: ArrayBuffer,
  fileName: string,
  fileType: FileType
) {
  // 5a. Tạo unique file ID
  const fileId = generateUUID();
  const encryptedFileName = `${fileId}.encrypted`;

  // 5b. Request presigned URL từ server
  const { uploadUrl, downloadUrl } = await fetch('/api/files/presigned-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: encryptedFileName,
      fileType: 'application/octet-stream', // Luôn là binary
      fileSize: encryptedFile.byteLength
    })
  }).then(r => r.json());

  // 5c. Upload trực tiếp lên S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: encryptedFile,
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  });

  return { fileId, downloadUrl };
}

BƯỚC 6: Mã hóa file metadata và key
async function encryptFileMetadata(
  fileKey: ArrayBuffer,
  iv: Uint8Array,
  thumbnailIv: Uint8Array | null,
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: FileType;
    mimeType: string;
  },
  recipientPublicKey: CryptoKey
) {
  // 6a. Tạo payload chứa key và metadata
  const payload = {
    fileKey: arrayBufferToBase64(fileKey),
    iv: arrayBufferToBase64(iv),
    thumbnailIv: thumbnailIv ? arrayBufferToBase64(thumbnailIv) : null,
    ...metadata
  };

  const payloadString = JSON.stringify(payload);
  const payloadBuffer = stringToArrayBuffer(payloadString);

  // 6b. Mã hóa bằng public key của recipient
  // Vì RSA không thể mã hóa data lớn, ta dùng hybrid:
  // - Sinh symmetric key cho metadata
  // - Mã hóa metadata bằng symmetric key
  // - Mã hóa symmetric key bằng RSA

  const metadataKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );

  const metadataIv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedPayload = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: metadataIv },
    metadataKey,
    payloadBuffer
  );

  const exportedMetadataKey = await crypto.subtle.exportKey('raw', metadataKey);

  // Mã hóa metadata key bằng RSA public key
  const encryptedMetadataKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPublicKey,
    exportedMetadataKey
  );

  return {
    encryptedPayload: arrayBufferToBase64(encryptedPayload),
    encryptedMetadataKey: arrayBufferToBase64(encryptedMetadataKey),
    metadataIv: arrayBufferToBase64(metadataIv)
  };
}

BƯỚC 7: Gửi message với file attachment
async function sendFileMessage(
  recipientId: string,
  fileId: string,
  downloadUrl: string,
  encryptedMetadata: any,
  encryptedThumbnail: ArrayBuffer | null
) {
  const message = {
    type: 'file',
    recipientId,
    fileId,
    downloadUrl, // URL của encrypted file trên S3
    encryptedThumbnail: encryptedThumbnail
      ? arrayBufferToBase64(encryptedThumbnail)
      : null,
    encryptedMetadata: encryptedMetadata,
    timestamp: Date.now()
  };

  // Gửi qua WebSocket hoặc REST API
  await sendMessage(message);
}
```

### 3.3. Nhận và hiển thị file

```typescript
BƯỚC 1: Nhận message
async function onFileMessageReceived(message: FileMessage) {
  // Message structure:
  // {
  //   type: 'file',
  //   fileId: '...',
  //   downloadUrl: 'https://s3.../xxx.encrypted',
  //   encryptedThumbnail: 'base64...',
  //   encryptedMetadata: { ... }
  // }

  // Hiển thị loading state
  displayFileMessagePlaceholder(message.fileId);
}

BƯỚC 2: Giải mã metadata
async function decryptFileMetadata(
  encryptedMetadata: {
    encryptedPayload: string;
    encryptedMetadataKey: string;
    metadataIv: string;
  },
  myPrivateKey: CryptoKey
) {
  // 2a. Giải mã metadata key bằng RSA private key
  const encryptedMetadataKeyBuffer = base64ToArrayBuffer(
    encryptedMetadata.encryptedMetadataKey
  );

  const metadataKeyBuffer = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    myPrivateKey,
    encryptedMetadataKeyBuffer
  );

  // 2b. Import metadata key
  const metadataKey = await crypto.subtle.importKey(
    'raw',
    metadataKeyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // 2c. Giải mã payload
  const encryptedPayloadBuffer = base64ToArrayBuffer(
    encryptedMetadata.encryptedPayload
  );
  const ivBuffer = base64ToArrayBuffer(encryptedMetadata.metadataIv);

  const decryptedPayloadBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    metadataKey,
    encryptedPayloadBuffer
  );

  const payloadString = arrayBufferToString(decryptedPayloadBuffer);
  const payload = JSON.parse(payloadString);

  // payload = {
  //   fileKey: 'base64...',
  //   iv: 'base64...',
  //   thumbnailIv: 'base64...',
  //   fileName: 'vacation.jpg',
  //   fileSize: 5242880,
  //   fileType: 'image',
  //   mimeType: 'image/jpeg'
  // }

  return payload;
}

BƯỚC 3: Giải mã và hiển thị thumbnail (nếu có)
async function decryptAndDisplayThumbnail(
  encryptedThumbnail: string,
  fileKey: string,
  thumbnailIv: string
) {
  const encryptedBuffer = base64ToArrayBuffer(encryptedThumbnail);
  const keyBuffer = base64ToArrayBuffer(fileKey);
  const ivBuffer = base64ToArrayBuffer(thumbnailIv);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decryptedThumbnail = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  );

  // Hiển thị thumbnail
  const blob = new Blob([decryptedThumbnail], { type: 'image/jpeg' });
  const thumbnailUrl = URL.createObjectURL(blob);

  displayThumbnail(thumbnailUrl);

  return thumbnailUrl;
}

BƯỚC 4: Download và giải mã file khi user click
async function downloadAndDecryptFile(
  downloadUrl: string,
  fileKey: string,
  iv: string,
  fileName: string,
  mimeType: string
) {
  // 4a. Download encrypted file từ S3
  const response = await fetch(downloadUrl);
  const encryptedFile = await response.arrayBuffer();

  // 4b. Import file key
  const keyBuffer = base64ToArrayBuffer(fileKey);
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // 4c. Giải mã file
  const ivBuffer = base64ToArrayBuffer(iv);
  const decryptedFile = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedFile
  );

  // 4d. Tạo blob và URL
  const blob = new Blob([decryptedFile], { type: mimeType });
  const fileUrl = URL.createObjectURL(blob);

  return { blob, fileUrl };
}

BƯỚC 5: Hiển thị hoặc download
async function handleFileDisplay(
  fileType: FileType,
  blob: Blob,
  fileUrl: string,
  fileName: string
) {
  switch (fileType) {
    case FileType.IMAGE:
      // Hiển thị ảnh trong modal/lightbox
      displayImageInViewer(fileUrl);
      break;

    case FileType.VIDEO:
      // Hiển thị video player
      displayVideoPlayer(fileUrl);
      break;

    case FileType.DOCUMENT:
      // Nếu là PDF, hiển thị trong iframe
      if (fileName.endsWith('.pdf')) {
        displayPdfViewer(fileUrl);
      } else {
        // Download
        downloadFile(blob, fileName);
      }
      break;

    default:
      // Download file
      downloadFile(blob, fileName);
  }
}

function downloadFile(blob: Blob, fileName: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
```

### 3.4. Tối ưu hóa cho file lớn

```typescript
CHUNKED UPLOAD/DOWNLOAD cho file > 10MB

// Upload
async function uploadLargeEncryptedFile(
  encryptedFile: ArrayBuffer,
  fileId: string
) {
  const totalChunks = Math.ceil(encryptedFile.byteLength / FILE_CHUNK_SIZE);

  // Initiate multipart upload
  const { uploadId } = await fetch('/api/files/multipart/initiate', {
    method: 'POST',
    body: JSON.stringify({ fileId, totalChunks })
  }).then(r => r.json());

  // Upload từng chunk
  const uploadPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * FILE_CHUNK_SIZE;
    const end = Math.min(start + FILE_CHUNK_SIZE, encryptedFile.byteLength);
    const chunk = encryptedFile.slice(start, end);

    uploadPromises.push(
      uploadChunk(fileId, uploadId, i + 1, chunk)
    );
  }

  // Upload parallel (limit 3 concurrent)
  await promiseAllWithLimit(uploadPromises, 3);

  // Complete multipart upload
  const { downloadUrl } = await fetch('/api/files/multipart/complete', {
    method: 'POST',
    body: JSON.stringify({ fileId, uploadId })
  }).then(r => r.json());

  return downloadUrl;
}

// Download với progress
async function downloadLargeFileWithProgress(
  downloadUrl: string,
  onProgress: (progress: number) => void
) {
  const response = await fetch(downloadUrl);
  const contentLength = response.headers.get('content-length');
  const total = parseInt(contentLength || '0');

  let loaded = 0;
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loaded += value.length;
    onProgress(Math.round((loaded / total) * 100));
  }

  // Combine chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result.buffer;
}
```

## 4. Xử lý các loại file đặc biệt

### 4.1. Ảnh (Image)

```typescript
async function processImageFile(file: File) {
  // 1. Compress ảnh trước khi mã hóa (giảm size)
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
  });

  // 2. Generate thumbnail nhỏ (blur cho preview nhanh)
  const thumbnail = await generateImageThumbnail(compressed, {
    width: 200,
    height: 200,
    quality: 0.6,
  });

  // 3. Extract EXIF và xóa dữ liệu nhạy cảm
  const sanitized = await removeExifData(compressed);

  return { file: sanitized, thumbnail };
}

async function compressImage(
  file: File,
  options: { maxWidth: number; maxHeight: number; quality: number }
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Calculate new dimensions
      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", options.quality);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### 4.2. Video

```typescript
async function processVideoFile(file: File) {
  // 1. Generate thumbnail từ frame đầu tiên
  const thumbnail = await generateVideoThumbnail(file);

  // 2. Extract metadata (duration, resolution)
  const metadata = await extractVideoMetadata(file);

  // 3. KHÔNG compress video trên client (quá nặng)
  //    Nếu cần compress, làm trên server TRƯỚC khi upload S3

  return { file, thumbnail, metadata };
}

async function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = 1; // Lấy frame ở giây thứ 1
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.7);
    };

    video.onerror = () => reject(new Error("Cannot load video"));
    video.src = URL.createObjectURL(file);
  });
}
```

### 4.3. Documents (PDF, DOCX, etc.)

```typescript
async function processDocumentFile(file: File) {
  // 1. Detect file type
  const mimeType = file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();

  // 2. Generate icon/preview based on type
  let preview = null;
  if (mimeType === "application/pdf") {
    preview = await generatePdfThumbnail(file);
  }

  // 3. Validate file (check for macros, viruses - optional)
  // Scan basic properties only, don't open

  return { file, preview, extension };
}

// Sử dụng PDF.js để generate thumbnail
async function generatePdfThumbnail(file: File): Promise<Blob> {
  // Implement với pdf.js library
  // Load first page và render to canvas
  // Return canvas as blob
}
```

## 5. Server-side components

### 5.1. Presigned URL API

```typescript
// Backend: Node.js + AWS SDK
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

app.post("/api/files/presigned-url", async (req, res) => {
  const { fileName, fileType, fileSize } = req.body;
  const userId = req.user.id; // From auth middleware

  // Validate
  if (fileSize > MAX_FILE_SIZE) {
    return res.status(400).json({ error: "File too large" });
  }

  // Generate unique key
  const fileKey = `encrypted-files/${userId}/${Date.now()}-${fileName}`;

  // Create presigned URL for upload (expires in 15 minutes)
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
    ContentType: "application/octet-stream",
    ServerSideEncryption: "AES256", // S3 encryption at rest (thêm lớp bảo mật)
    Metadata: {
      "uploaded-by": userId,
      encrypted: "true",
    },
  });

  const uploadUrl = await getSignedUrl(s3Client, uploadCommand, {
    expiresIn: 900, // 15 minutes
  });

  // Generate download URL (no expiration, nhưng S3 bucket là private)
  const downloadUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileKey}`;

  // Save file record to database
  await db.files.create({
    id: generateUUID(),
    userId,
    fileKey,
    fileName, // Encrypted file name (not revealed)
    fileSize,
    uploadedAt: new Date(),
    status: "pending",
  });

  res.json({ uploadUrl, downloadUrl, fileKey });
});
```

### 5.2. Signed URL cho download (với expiration)

```typescript
app.get("/api/files/:fileId/download-url", async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.id;

  // Check permission (user phải là sender hoặc recipient)
  const file = await db.files.findOne({ id: fileId });
  const message = await db.messages.findOne({ fileId });

  if (message.senderId !== userId && message.recipientId !== userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Generate signed URL (expires in 1 hour)
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: file.fileKey,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  res.json({ downloadUrl: signedUrl });
});
```

## 6. Trường hợp ngoại lệ

### 6.1. Upload failed giữa chừng

```typescript
// Client: Retry logic
async function uploadWithRetry(encryptedFile: ArrayBuffer, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await uploadEncryptedFile(encryptedFile);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;

      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}

// Server: Cleanup orphaned files (cron job)
async function cleanupOrphanedFiles() {
  // Find files uploaded > 24h ago but not linked to any message
  const orphans = await db.files.find({
    uploadedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    status: "pending",
  });

  for (const file of orphans) {
    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: file.fileKey,
      })
    );

    // Delete from DB
    await db.files.delete({ id: file.id });
  }
}
```

### 6.2. File key bị mất

```typescript
// Không thể giải mã file nếu mất key
// Solution: Multiple recipients

async function sendFileToMultipleRecipients(fileKey: ArrayBuffer, recipientIds: string[]) {
  const encryptedKeys = [];

  for (const recipientId of recipientIds) {
    const publicKey = await getPublicKey(recipientId);
    const encryptedKey = await encryptFileKey(fileKey, publicKey);
    encryptedKeys.push({ recipientId, encryptedKey });
  }

  return encryptedKeys;
}

// Trong database: Lưu encrypted key cho mỗi recipient
// messages table:
// {
//   fileId,
//   encryptedKeys: [
//     { userId: 'user1', encryptedKey: '...' },
//     { userId: 'user2', encryptedKey: '...' }
//   ]
// }
```

### 6.3. S3 bucket bị compromise

```
Vì file đã mã hóa trên client:
└─ Attacker chỉ thấy encrypted binary data
    └─ Không thể giải mã nếu không có file key
        └─ File key chỉ có ở client của sender/receiver

Nhưng metadata leak:
├─ File size (có thể đoán loại file)
├─ Upload time
└─ User association

Giải pháp: Encrypt filename và metadata
```

### 6.4. Hiển thị file bị lỗi

```typescript
// Error handling khi decrypt
try {
  const decryptedFile = await decryptFile(encryptedFile, key, iv);
  displayFile(decryptedFile);
} catch (error) {
  if (error.name === "OperationError") {
    // Wrong key hoặc corrupted file
    displayError("Không thể giải mã file. File có thể bị hỏng.");
  } else if (error.name === "NetworkError") {
    // Download failed
    displayError("Không thể tải file. Vui lòng thử lại.");
  } else {
    displayError("Lỗi không xác định.");
  }

  // Log error để debug
  logError(error);
}
```

## 7. Kết quả mong đợi

### 7.1. Bảo mật

```
✅ File content được mã hóa E2E
✅ Server không thể xem nội dung file
✅ S3 bucket leak không làm lộ nội dung
✅ Chỉ sender và recipient có thể decrypt
✅ File key độc lập cho mỗi file (forward secrecy)
✅ Thumbnail cũng được mã hóa
```

### 7.2. Performance

```
✅ Mã hóa file 5MB: ~200-500ms (tùy device)
✅ Upload encrypted file: Tương đương plaintext
✅ Download + decrypt: +100-300ms so với plaintext
✅ Thumbnail decrypt: <50ms (hiển thị ngay)
✅ Chunked upload cho file lớn: Smooth progress
```

### 7.3. UX

```
✅ User không nhận biết quá trình mã hóa
✅ Thumbnail hiển thị ngay lập tức
✅ Progress bar rõ ràng khi upload/download
✅ Support tất cả file types
✅ Preview ảnh/video/PDF trong app
✅ Download button cho các file khác
```

### 7.4. Scalability

```
✅ Support file up to 100MB
✅ Chunked upload/download cho file lớn
✅ Parallel chunk uploads
✅ CDN có thể cache encrypted files (không risk)
✅ S3 lifecycle policies để xóa old files
```

Bạn muốn tôi tạo artifact với code hoàn chỉnh cho phần mã hóa file không?
