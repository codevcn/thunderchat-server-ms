# Quy trình E2EE trong nhắn tin - Bức tranh tổng quan

Tôi sẽ giải thích từng bước một cách chi tiết, với các đối tượng tham gia và vai trò của từng khóa.

---

## 🎭 CÁC NHÂN VẬT THAM GIA

### 1. **User A** (Alice - Người gửi)

- Thiết bị: **Device A** (Chrome trên laptop)
- Có **Private Key A** (chỉ lưu trên Device A)
- Có **Public Key A** (lưu trên server)

### 2. **User B** (Bob - Người nhận)

- Thiết bị: **Device B** (Safari trên iPhone)
- Có **Private Key B** (chỉ lưu trên Device B)
- Có **Public Key B** (lưu trên server)

### 3. **Server**

- Lưu Public Key A và Public Key B
- Lưu tin nhắn đã mã hóa
- **KHÔNG có Private Key của ai cả**
- **KHÔNG thể đọc nội dung tin nhắn**

---

## 📋 GIAI ĐOẠN 1: KHỞI TẠO TÀI KHOẢN

### Bước 1.1: Alice đăng ký tài khoản

```
[Device A - Browser của Alice]
┌─────────────────────────────────────────┐
│ 1. User nhập email/password             │
│ 2. Click "Đăng ký"                      │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 3. Client sinh cặp khóa RSA-2048        │
│    • Private Key A (2048 bit)           │
│    • Public Key A (2048 bit)            │
│                                         │
│ 4. Sinh Key ID (fingerprint)            │
│    keyId = SHA256(Public Key A)         │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 5. Mã hóa Private Key A                 │
│    Dùng password của user làm khóa      │
│    encryptedPrivateKey =                │
│      AES-256(Private Key A, password)   │
│                                         │
│ 6. Lưu vào IndexedDB                    │
│    {                                    │
│      keyId: "abc123...",                │
│      encryptedPrivateKey: "...",        │
│      algorithm: "RSA-OAEP"              │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 7. Gửi lên Server:                      │
│    POST /api/auth/register              │
│    {                                    │
│      email: "alice@...",                │
│      password: "hashed...",             │
│      publicKey: "-----BEGIN PUBLIC...", │
│      keyId: "abc123...",                │
│      algorithm: "RSA-OAEP"              │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ [SERVER]                                │
│ 8. Lưu vào database:                    │
│                                         │
│ Table: users                            │
│ - id: 1                                 │
│ - email: "alice@..."                    │
│ - password: "hashed..."                 │
│                                         │
│ Table: user_public_keys                 │
│ - userId: 1                             │
│ - publicKey: "-----BEGIN PUBLIC..."     │
│ - keyId: "abc123..."                    │
│ - algorithm: "RSA-OAEP"                 │
│ - isActive: true                        │
└─────────────────────────────────────────┘
```

**💡 Lưu ý quan trọng:**

- Private Key A **KHÔNG BAO GIỜ** rời khỏi Device A
- Server chỉ nhận và lưu Public Key A
- Private Key A được mã hóa bằng password trước khi lưu vào IndexedDB

---

## 📋 GIAI ĐOẠN 2: THIẾT LẬP CUỘC TRÒ CHUYỆN MÃ HÓA

### Bước 2.1: Alice muốn nhắn tin mã hóa cho Bob

```
[Device A - Alice's Browser]
┌─────────────────────────────────────────┐
│ 1. Alice mở chat với Bob                │
│ 2. Click "Bật mã hóa đầu cuối"          │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 3. Client yêu cầu Public Key của Bob    │
│    GET /api/users/bob/public-key        │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ [SERVER]                                │
│ 4. Server trả về Public Key B           │
│    {                                    │
│      publicKey: "-----BEGIN PUBLIC...", │
│      keyId: "xyz789...",                │
│      algorithm: "RSA-OAEP"              │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
[Device A - Alice's Browser]
┌─────────────────────────────────────────┐
│ 5. Sinh Session Key (AES-256)           │
│    sessionKey = random(256 bits)        │
│    Ví dụ: "a1b2c3d4e5f6..."            │
│                                         │
│ 6. Sinh IV (Initialization Vector)      │
│    iv = random(128 bits)                │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 7. Mã hóa Session Key cho 2 người       │
│                                         │
│ Cho Alice (tự mã hóa):                  │
│   encryptedKeyForAlice =                │
│     RSA-OAEP(sessionKey, Public Key A)  │
│                                         │
│ Cho Bob:                                │
│   encryptedKeyForBob =                  │
│     RSA-OAEP(sessionKey, Public Key B)  │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 8. Tạo Safety Number                    │
│    safetyNumberAlice =                  │
│      SHA256(Public Key A + Public Key B)│
│    safetyNumberBob =                    │
│      SHA256(Public Key B + Public Key A)│
│                                         │
│    → Dùng để verify sau này             │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 9. Gửi lên Server:                      │
│    POST /api/chats/setup-encryption     │
│    {                                    │
│      recipientId: bobId,                │
│      encryptedKeyForCreator: "...",     │
│      encryptedKeyForRecipient: "...",   │
│      keyVersion: 1,                     │
│      algorithm: "AES-256-GCM",          │
│      safetyNumberCreator: "...",        │
│      safetyNumberRecipient: "..."       │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ [SERVER]                                │
│ 10. Lưu vào database:                   │
│                                         │
│ Table: direct_chats                     │
│ - id: 1                                 │
│ - creatorId: aliceId                    │
│ - recipientId: bobId                    │
│ - isEncrypted: true                     │
│ - encryptionEnabled: true               │
│ - currentKeyVersion: 1                  │
│ - safetyNumberCreator: "..."            │
│ - safetyNumberRecipient: "..."          │
│ - encryptionSetupAt: now()              │
│                                         │
│ Table: encrypted_chat_session_keys      │
│ - directChatId: 1                       │
│ - encryptedKeyForCreator: "..."         │
│ - encryptedKeyForRecipient: "..."       │
│ - keyVersion: 1                         │
│ - algorithm: "AES-256-GCM"              │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 11. Server push notification cho Bob    │
│     "Alice đã bật mã hóa đầu cuối"      │
└─────────────────────────────────────────┘
```

**💡 Giải thích:**

- **Session Key** là khóa đối xứng (AES-256) dùng để mã hóa nội dung tin nhắn thực tế
- Session Key được mã hóa bằng RSA và gửi cho cả 2 người
- Server lưu Session Key đã mã hóa, nhưng **KHÔNG thể giải mã** vì không có Private Key
- Safety Number để verify không có MITM attack

---

## 📋 GIAI ĐOẠN 3: GỬI TIN NHẮN MÃ HÓA

### Bước 3.1: Alice gửi tin nhắn "Hello Bob!"

```
[Device A - Alice's Browser]
┌─────────────────────────────────────────┐
│ 1. Alice gõ: "Hello Bob!"               │
│ 2. Click "Gửi"                          │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 3. Lấy encryptedKeyForCreator từ cache  │
│    (hoặc fetch từ server nếu chưa có)   │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 4. Giải mã Session Key                  │
│                                         │
│ Lấy Private Key A từ IndexedDB:         │
│   - Nhập password để decrypt            │
│   - privateKeyA = decrypt(encrypted...) │
│                                         │
│ Giải mã Session Key:                    │
│   sessionKey =                          │
│     RSA-OAEP-Decrypt(                   │
│       encryptedKeyForCreator,           │
│       privateKeyA                       │
│     )                                   │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 5. Mã hóa nội dung tin nhắn              │
│                                         │
│ plaintext = "Hello Bob!"                │
│                                         │
│ Sinh IV mới cho tin nhắn này:           │
│   iv = random(128 bits)                 │
│                                         │
│ Mã hóa:                                 │
│   {ciphertext, authTag} =               │
│     AES-256-GCM-Encrypt(                │
│       plaintext: "Hello Bob!",          │
│       key: sessionKey,                  │
│       iv: iv                            │
│     )                                   │
│                                         │
│ Kết quả:                                │
│   ciphertext = "xa7b2c9f..."            │
│   authTag = "1a2b3c4d..."               │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 6. Mã hóa DEK (Data Encryption Key)     │
│                                         │
│ DEK = sessionKey (hoặc sinh mới)        │
│ encryptedDEK =                          │
│   AES-256-Wrap(DEK, sessionKey)         │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 7. Tạo chữ ký số (optional)             │
│                                         │
│ signature =                             │
│   RSA-PSS-Sign(                         │
│     data: ciphertext + iv + authTag,    │
│     privateKey: privateKeyA             │
│   )                                     │
│                                         │
│ → Để Bob verify tin nhắn từ Alice       │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 8. Gửi lên Server:                      │
│    POST /api/messages/send              │
│    {                                    │
│      directChatId: 1,                   │
│      authorId: aliceId,                 │
│      recipientId: bobId,                │
│      content: "xa7b2c9f...",  ← ENCRYPTED│
│      isEncrypted: true,                 │
│      encryptionKeyVersion: 1,           │
│      iv: "1a2b3c...",                   │
│      authTag: "1a2b3c4d...",            │
│      dek: "encryptedDEK...",            │
│      senderKeyId: "abc123...",          │
│      signature: "signature...",         │
│      type: "TEXT",                      │
│      status: "SENT"                     │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ [SERVER]                                │
│ 9. Server nhận và lưu:                  │
│                                         │
│ Table: messages                         │
│ - id: 101                               │
│ - directChatId: 1                       │
│ - authorId: aliceId                     │
│ - recipientId: bobId                    │
│ - content: "xa7b2c9f..."  ← ENCRYPTED   │
│ - isEncrypted: true                     │
│ - iv: "1a2b3c..."                       │
│ - authTag: "1a2b3c4d..."                │
│ - dek: "encryptedDEK..."                │
│ - signature: "..."                      │
│ - status: "SENT"                        │
│                                         │
│ ⚠️ Server KHÔNG thể đọc "Hello Bob!"    │
│    Vì không có sessionKey!              │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 10. Server push tin nhắn cho Bob        │
│     qua WebSocket                       │
│                                         │
│     ws.emit('new-message', {            │
│       messageId: 101,                   │
│       content: "xa7b2c9f...",           │
│       iv: "...",                        │
│       authTag: "...",                   │
│       ...                               │
│     })                                  │
└─────────────────────────────────────────┘
```

**💡 Các khóa sử dụng:**

1. **Private Key A** → Giải mã encryptedKeyForCreator để lấy sessionKey
2. **Session Key** → Mã hóa nội dung "Hello Bob!"
3. **IV** → Đảm bảo mỗi tin nhắn có ciphertext khác nhau
4. **AuthTag** → Xác thực tính toàn vẹn của tin nhắn
5. **DEK** → Mã hóa metadata hoặc media lớn
6. **Signature** → Chứng minh tin nhắn từ Alice

---

## 📋 GIAI ĐOẠN 4: NHẬN VÀ GIẢI MÃ TIN NHẮN

### Bước 4.1: Bob nhận tin nhắn từ Alice

```
[Device B - Bob's iPhone]
┌─────────────────────────────────────────┐
│ 1. WebSocket nhận event:                │
│    "new-message" từ Alice               │
│                                         │
│    messageData = {                      │
│      messageId: 101,                    │
│      content: "xa7b2c9f...",  ← ENCRYPTED│
│      iv: "1a2b3c...",                   │
│      authTag: "1a2b3c4d...",            │
│      dek: "encryptedDEK...",            │
│      signature: "...",                  │
│      senderKeyId: "abc123..."           │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 2. Verify sender's public key           │
│                                         │
│ Kiểm tra senderKeyId có khớp với        │
│ Public Key A đã lưu không?              │
│                                         │
│ if (senderKeyId !== savedKeyId) {       │
│   → Cảnh báo: "Key đã thay đổi!"       │
│   → Yêu cầu verify safety number        │
│ }                                       │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 3. Lấy encryptedKeyForRecipient         │
│                                         │
│ Fetch từ cache hoặc server:             │
│   GET /api/chats/1/session-key          │
│                                         │
│ Server trả về:                          │
│   {                                     │
│     encryptedKeyForRecipient: "...",    │
│     keyVersion: 1                       │
│   }                                     │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 4. Giải mã Session Key                  │
│                                         │
│ Lấy Private Key B từ IndexedDB:         │
│   - Face ID hoặc nhập password          │
│   - privateKeyB = decrypt(encrypted...) │
│                                         │
│ Giải mã Session Key:                    │
│   sessionKey =                          │
│     RSA-OAEP-Decrypt(                   │
│       encryptedKeyForRecipient,         │
│       privateKeyB                       │
│     )                                   │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 5. Verify chữ ký số                     │
│                                         │
│ Lấy Public Key A của Alice:             │
│   publicKeyA = cache.get('alice-key')   │
│                                         │
│ Verify:                                 │
│   isValid =                             │
│     RSA-PSS-Verify(                     │
│       data: ciphertext + iv + authTag,  │
│       signature: signature,             │
│       publicKey: publicKeyA             │
│     )                                   │
│                                         │
│ if (!isValid) {                         │
│   → Cảnh báo: "Tin nhắn không hợp lệ!"  │
│   → Không hiển thị nội dung             │
│   return;                               │
│ }                                       │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 6. Giải mã DEK                          │
│                                         │
│ dek =                                   │
│   AES-256-Unwrap(                       │
│     encryptedDEK,                       │
│     sessionKey                          │
│   )                                     │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 7. Giải mã nội dung tin nhắn             │
│                                         │
│ ciphertext = "xa7b2c9f..."              │
│ iv = "1a2b3c..."                        │
│ authTag = "1a2b3c4d..."                 │
│                                         │
│ plaintext =                             │
│   AES-256-GCM-Decrypt(                  │
│     ciphertext: ciphertext,             │
│     key: sessionKey,                    │
│     iv: iv,                             │
│     authTag: authTag                    │
│   )                                     │
│                                         │
│ Kết quả:                                │
│   plaintext = "Hello Bob!"              │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 8. Hiển thị tin nhắn lên UI             │
│                                         │
│ [Chat Window]                           │
│ ┌─────────────────────────────────┐     │
│ │ Alice            10:30 AM   🔒  │     │
│ │ Hello Bob!                      │     │
│ └─────────────────────────────────┘     │
│                                         │
│ Badge 🔒 = Tin nhắn đã mã hóa E2E       │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 9. Gửi xác nhận đã nhận (optional)      │
│    PUT /api/messages/101/status         │
│    { status: "SEEN" }                   │
└─────────────────────────────────────────┘
```

**💡 Các khóa sử dụng:**

1. **Private Key B** → Giải mã encryptedKeyForRecipient để lấy sessionKey
2. **Session Key** → Giải mã ciphertext thành "Hello Bob!"
3. **Public Key A** → Verify chữ ký của Alice
4. **IV + AuthTag** → Giải mã và verify tính toàn vẹn
5. **DEK** → Giải mã metadata

---

## 🔄 GIAI ĐOẠN 5: KEY ROTATION (Đổi khóa định kỳ)

### Tại sao cần đổi khóa?

- Tăng bảo mật (forward secrecy)
- Giảm thiểu thiệt hại nếu key bị lộ
- Best practice: đổi key mỗi 30 ngày hoặc sau 10,000 tin nhắn

### Quy trình đổi Session Key:

```
[Device A - Alice's Browser]
┌─────────────────────────────────────────┐
│ 1. Điều kiện trigger key rotation:      │
│    - Đã gửi > 10,000 tin nhắn           │
│    - Hoặc > 30 ngày kể từ lần cuối      │
│    - Hoặc user click "Đổi khóa"         │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 2. Sinh Session Key mới                 │
│    newSessionKey = random(256 bits)     │
│    keyVersion = 2  (tăng lên)           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 3. Mã hóa Session Key mới                │
│                                         │
│    encryptedKeyForAlice =               │
│      RSA-OAEP(newSessionKey, PublicKeyA)│
│                                         │
│    encryptedKeyForBob =                 │
│      RSA-OAEP(newSessionKey, PublicKeyB)│
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 4. Gửi lên server                       │
│    POST /api/chats/1/rotate-key         │
│    {                                    │
│      encryptedKeyForCreator: "...",     │
│      encryptedKeyForRecipient: "...",   │
│      keyVersion: 2                      │
│    }                                    │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ [SERVER]                                │
│ 5. Lưu vào database:                    │
│                                         │
│ Table: encrypted_chat_session_keys      │
│ - Thêm record mới với keyVersion: 2     │
│ - Giữ lại keyVersion: 1 (cho tin cũ)    │
│                                         │
│ Table: direct_chats                     │
│ - currentKeyVersion: 2                  │
│ - lastKeyRotationAt: now()              │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│ 6. Tin nhắn mới dùng keyVersion: 2      │
│    Tin nhắn cũ vẫn dùng keyVersion: 1   │
│    để giải mã                           │
└─────────────────────────────────────────┘
```

---

## 🔐 TÓM TẮT VAI TRÒ CỦA TỪNG KHÓA

### 1. **Private Key (RSA-2048)**

- **Nơi lưu:** Chỉ trên thiết bị của user (IndexedDB)
- **Mã hóa bởi:** Password của user
- **Mục đích:** Giải mã Session Key
- **Bảo mật:** TUYỆT ĐỐI không rời khỏi thiết bị

### 2. **Public Key (RSA-2048)**

- **Nơi lưu:** Server (table `user_public_keys`)
- **Mục đích:**
  - Mã hóa Session Key cho người nhận
  - Verify chữ ký số
- **Chia sẻ:** Công khai, ai cũng có thể lấy

### 3. **Session Key (AES-256)**

- **Nơi lưu:**
  - Dạng mã hóa trên server (`encrypted_chat_session_keys`)
  - Dạng plaintext trong memory của device (cache)
- **Mục đích:** Mã hóa/giải mã nội dung tin nhắn thực tế
- **Đặc điểm:** Đổi định kỳ (key rotation)

### 4. **DEK - Data Encryption Key (AES-256)**

- **Nơi lưu:** Trong mỗi tin nhắn (đã mã hóa)
- **Mục đích:** Mã hóa metadata, media lớn
- **Mã hóa bởi:** Session Key

### 5. **IV - Initialization Vector (128 bits)**

- **Nơi lưu:** Trong mỗi tin nhắn (plaintext)
- **Mục đích:** Đảm bảo cùng plaintext → khác ciphertext
- **Đặc điểm:** Random mỗi tin nhắn

### 6. **AuthTag (128 bits)**

- **Nơi lưu:** Trong mỗi tin nhắn
- **Mục đích:** Xác thực tính toàn vẹn (GCM mode)
- **Verify:** Đảm bảo tin nhắn không bị sửa đổi

### 7. **Safety Number**

- **Nơi lưu:** Client + Server
- **Mục đích:** Verify không có MITM attack
- **Cách dùng:** So sánh trực tiếp hoặc quét QR code

---

## 🎯 BỨC TRANH TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│                         THIẾT BỊ ALICE                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IndexedDB:                                                  │ │
│ │ • Private Key A (encrypted by password)                     │ │
│ │ • Session Key (cache, plaintext trong memory)              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Quy trình gửi tin:                                          │ │
│ │ 1. Lấy Private Key A → Giải mã Session Key                  │ │
│ │ 2. Dùng Session Key → Mã hóa "Hello Bob!"                   │ │
│ │ 3. Gửi ciphertext lên server                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (TLS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                            SERVER                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Database - Dữ liệu công khai:                               │ │
│ │ • Public Key A                                              │ │
│ │ • Public Key B                                              │ │
│ │ • Safety Numbers                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Database - Dữ liệu đã mã hóa:                               │ │
│ │ • Session Key (encrypted for Alice)                         │ │
│ │ • Session Key (encrypted for Bob)                           │ │
│ │ • Messages: ciphertext + iv + authTag                       │ │
│ │                                                             │ │
│ │ ⚠️ Server KHÔNG THỂ đọc:                                    │ │
│ │   - Nội dung tin nhắn (không có Session Key plaintext)     │ │
│ │   - Session Key (không có Private Keys)                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Vai trò của server:                                         │ │
│ │ 1. Lưu trữ và phân phối Public Keys                         │ │
│ │ 2. Lưu encrypted Session Keys                               │ │
│ │ 3. Lưu encrypted messages                                   │ │
│ │ 4. Chuyển tiếp tin nhắn đến người nhận                      │ │
│ │ 5. KHÔNG tham gia vào encryption/decryption                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (TLS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         THIẾT BỊ BOB                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IndexedDB:                                                  │ │
│ │ • Private Key B (encrypted by password/biometric)           │ │
│ │ • Session Key (cache, plaintext trong memory)              │ │
│ │ • Public Key A (của Alice - để verify)                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Quy trình nhận tin:                                         │ │
│ │ 1. Nhận ciphertext từ server                                │ │
│ │ 2. Lấy Private Key B → Giải mã Session Key                  │ │
│ │ 3. Dùng Session Key → Giải mã ciphertext                    │ │
│ │ 4. Verify signature bằng Public Key A                       │ │
│ │ 5. Hiển thị "Hello Bob!" 🔒                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 LUỒNG DỮ LIỆU HOÀN CHỈNH

### Khi Alice gửi "Hello Bob!":

```
ALICE DEVICE                    SERVER                      BOB DEVICE
═════════════                   ══════                      ══════════

[1] Plaintext
"Hello Bob!"
     │
     ▼
[2] Lấy Session Key
Private Key A ─────┐
                   │ Decrypt
Encrypted Session──┘
Key (từ server)
     │
     ▼
Session Key (plaintext)
     │
     ▼
[3] Encrypt
AES-256-GCM(
  "Hello Bob!",
  Session Key
)
     │
     ▼
Ciphertext:          ────────►  [4] Nhận & Lưu
"xa7b2c9f..."                   ┌────────────────┐
+ IV                            │ messages table │
+ AuthTag                       │ • content: encrypted
+ Signature                     │ • iv: "..."    │
                                │ • authTag: "..."
                                │ • signature: "..."
                                └────────────────┘
                                       │
                                       │ Push via
                                       │ WebSocket
                                       ▼
                                                    [5] Nhận tin
                                                    Encrypted data
                                                         │
                                                         ▼
                                                    [6] Lấy Session Key
                                                    Private Key B ─────┐
                                                                       │
                                                    Encrypted Session──┘
                                                    Key (từ server)
                                                         │
                                                         ▼
                                                    Session Key
                                                    (plaintext)
                                                         │
                                                         ▼
                                                    [7] Decrypt
                                                    AES-256-GCM-Decrypt(
                                                      "xa7b2c9f...",
                                                      Session Key
                                                    )
                                                         │
                                                         ▼
                                                    [8] Verify
                                                    RSA-Verify(
                                                      signature,
                                                      Public Key A
                                                    )
                                                         │
                                                         ▼
                                                    [9] Hiển thị
                                                    "Hello Bob!" 🔒
```

---

## 🛡️ CÁC TÌNH HUỐNG BẢO MẬT

### Tình huống 1: Hacker chiếm được Database

```
┌─────────────────────────────────────────────────────────────────┐
│ HACKER có quyền truy cập Database                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Hacker CÓ THỂ thấy:                                          │
│   • Public Keys (vô dụng, không giải mã được gì)               │
│   • Encrypted Session Keys (không có Private Key để giải mã)   │
│   • Ciphertexts: "xa7b2c9f..." (vô nghĩa)                      │
│   • Metadata: ai nhắn ai, khi nào, bao nhiêu tin               │
│   • IVs, AuthTags (không đủ để giải mã)                        │
│                                                                 │
│ ❌ Hacker KHÔNG THỂ:                                            │
│   • Đọc nội dung tin nhắn (cần Session Key plaintext)          │
│   • Giải mã Session Key (cần Private Keys)                     │
│   • Giả mạo tin nhắn (cần Private Key để ký)                   │
│   • Sửa đổi tin nhắn (AuthTag sẽ fail)                         │
│                                                                 │
│ 🎯 KẾT LUẬN: Nội dung tin nhắn VẪN AN TOÀN                      │
└─────────────────────────────────────────────────────────────────┘
```

### Tình huống 2: MITM Attack (Man-in-the-Middle)

```
Kịch bản: Hacker chặn kết nối và thay đổi Public Key

ALICE                    HACKER                    SERVER
  │                        │                          │
  │ "Gửi Public Key A"     │                          │
  ├───────────────────────►│                          │
  │                        │ "Gửi Public Key Hacker"  │
  │                        ├─────────────────────────►│
  │                        │                          │
  │                        │◄────────────────────────┤
  │                        │ "OK, đã lưu"             │
  │◄───────────────────────┤                          │
  │ "OK"                   │                          │

─────────────────────────────────────────────────────────────────

PHÒNG CHỐNG:

[Device A]
┌─────────────────────────────────────────────────────────────────┐
│ 1. Khi setup E2E, tạo Safety Number:                           │
│                                                                 │
│    Safety Number A = SHA256(Public Key A + Public Key B)       │
│    Safety Number B = SHA256(Public Key B + Public Key A)       │
│                                                                 │
│    Ví dụ:                                                       │
│    Alice thấy: "12345 67890 11223"                             │
│    Bob thấy:   "12345 67890 11223"  (phải giống nhau)          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 2. Alice và Bob verify qua kênh khác:                          │
│    • Gọi điện thoại đọc số                                      │
│    • Gặp trực tiếp quét QR code                                │
│    • Nhắn qua app khác                                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 3. Nếu số KHÔNG khớp → CẢNH BÁO:                               │
│                                                                 │
│    ⚠️ NGUY HIỂM! Có thể có người đang chặn kết nối!           │
│    ⚠️ Public Key đã bị thay đổi!                               │
│    ⚠️ KHÔNG tiếp tục cho đến khi verify an toàn!               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tình huống 3: User mất Private Key

```
Kịch bản: Bob xóa app hoặc mất điện thoại

┌─────────────────────────────────────────────────────────────────┐
│ VẤN ĐỀ:                                                         │
│ • Private Key B bị mất                                          │
│ • Không thể giải mã Encrypted Session Key                      │
│ • Không thể đọc tin nhắn cũ                                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ GIẢI PHÁP:                                                      │
│                                                                 │
│ [Khi Bob cài lại app]                                          │
│ 1. Sinh cặp khóa mới (Public Key B', Private Key B')           │
│ 2. Upload Public Key B' lên server                             │
│ 3. Server đánh dấu Public Key B cũ là revoked                  │
│                                                                 │
│ [Hiển thị tin nhắn]                                            │
│ • Tin nhắn cũ: "🔒 [Tin nhắn đã mã hóa - Không thể giải mã]"   │
│ • Tin nhắn mới: Dùng Public Key B' mới → Đọc được bình thường  │
│                                                                 │
│ [Alice nhận thông báo]                                          │
│ ⚠️ "Bob đã thay đổi thiết bị/key"                              │
│ ⚠️ "Vui lòng verify Safety Number mới"                         │
│ • Safety Number mới = SHA256(Public Key A + Public Key B')     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tình huống 4: Đồng bộ đa thiết bị

```
Kịch bản: Bob muốn đọc tin nhắn trên cả iPhone và MacBook

┌─────────────────────────────────────────────────────────────────┐
│ PHƯƠNG ÁN 1: QR Code Pairing (Khuyến nghị)                     │
│                                                                 │
│ [iPhone - Device chính]              [MacBook - Device mới]    │
│        │                                      │                │
│        │  1. MacBook sinh temporary           │                │
│        │     public key                       │                │
│        │                                      │                │
│        │◄─────────────────────────────────────┤                │
│        │  2. Hiển thị QR code                 │                │
│        │     (chứa temporary public key)      │                │
│        │                                      │                │
│        │  3. iPhone scan QR                   │                │
│        ├──────────────────────────────────────►│                │
│        │                                      │                │
│        │  4. iPhone mã hóa Private Key B      │                │
│        │     bằng temporary public key        │                │
│        │                                      │                │
│        ├──────────────────────────────────────►│                │
│        │  5. Gửi encrypted Private Key        │                │
│        │     qua local network (không qua     │                │
│        │     server)                          │                │
│        │                                      │                │
│        │                                      │  6. MacBook    │
│        │                                      │     giải mã    │
│        │                                      │     bằng       │
│        │                                      │     temporary  │
│        │                                      │     private key│
│        │                                      │                │
│        │                                      │  7. Lưu vào   │
│        │                                      │     IndexedDB  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ PHƯƠNG ÁN 2: Cloud Backup (Encrypted)                          │
│                                                                 │
│ [iPhone]                                                        │
│    │                                                            │
│    │  1. User nhập Master Password                             │
│    │     (khác với login password)                             │
│    │                                                            │
│    │  2. Derive Backup Key từ Master Password                  │
│    │     backupKey = PBKDF2(masterPassword, salt, 100k)        │
│    │                                                            │
│    │  3. Mã hóa Private Key B                                  │
│    │     encryptedBackup = AES-256(Private Key B, backupKey)   │
│    │                                                            │
│    │  4. Upload lên server                                     │
│    │     POST /api/backup                                      │
│    │     { encryptedBackup, salt }                             │
│    │                                                            │
│ [Server]                                                        │
│    • Lưu encryptedBackup (KHÔNG thể giải mã)                   │
│    • Server chỉ là storage, không có backupKey                 │
│                                                                 │
│ [MacBook]                                                       │
│    │  5. User nhập Master Password                             │
│    │                                                            │
│    │  6. Download encryptedBackup từ server                    │
│    │     GET /api/backup                                       │
│    │                                                            │
│    │  7. Derive Backup Key (giống bước 2)                      │
│    │                                                            │
│    │  8. Giải mã Private Key B                                 │
│    │     privateKeyB = AES-256-Decrypt(encryptedBackup,        │
│    │                                   backupKey)              │
│    │                                                            │
│    │  9. Lưu vào IndexedDB của MacBook                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 BẢNG SO SÁNH CÁC LOẠI KHÓA

| Khóa            | Thuật toán | Kích thước | Nơi lưu            | Mục đích            | Đổi khi nào?                         |
| --------------- | ---------- | ---------- | ------------------ | ------------------- | ------------------------------------ |
| **Private Key** | RSA-2048   | 2048 bit   | Device (IndexedDB) | Giải mã Session Key | Khi bị compromise hoặc user chủ động |
| **Public Key**  | RSA-2048   | 2048 bit   | Server DB          | Mã hóa Session Key  | Khi Private Key đổi                  |
| **Session Key** | AES-256    | 256 bit    | Memory (cache)     | Mã hóa nội dung     | Mỗi 30 ngày hoặc 10k tin             |
| **DEK**         | AES-256    | 256 bit    | Mỗi message        | Mã hóa metadata     | Mỗi tin nhắn (optional)              |
| **IV**          | Random     | 128 bit    | Mỗi message        | Randomization       | Mỗi tin nhắn (bắt buộc)              |
| **AuthTag**     | GCM        | 128 bit    | Mỗi message        | Authentication      | Mỗi tin nhắn (auto)                  |

---

## 🎯 KẾT LUẬN

### Lợi ích của thiết kế này:

1. **Zero-Knowledge Architecture**
   - Server không bao giờ thấy plaintext
   - Ngay cả admin cũng không đọc được tin nhắn

2. **Forward Secrecy**
   - Session Key rotation đảm bảo tin nhắn cũ an toàn
   - Nếu key hiện tại bị lộ, tin nhắn cũ vẫn an toàn

3. **Deniable Authentication**
   - Chỉ người trong cuộc verify được
   - Không thể chứng minh với bên thứ ba

4. **Multi-device Support**
   - QR pairing hoặc encrypted backup
   - User control hoàn toàn

5. **Audit & Compliance**
   - Key rotation logs
   - Safety number verification
   - Transparent về security

### Trade-offs cần lưu ý:

❌ **Không thể search tin nhắn cũ trên server**
→ Phải search local trên device

❌ **Mất Private Key = mất tin nhắn cũ**
→ Cần giáo dục user về backup

❌ **Performance overhead**
→ Mã hóa/giải mã tốn thời gian (nhưng < 100ms)

❌ **Không thể moderate nội dung**
→ Phải dựa vào report của user

Bạn có muốn tôi giải thích thêm phần nào hoặc viết code implement không?
