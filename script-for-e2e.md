# Kịch bản mã hóa đầu cuối (E2E) cho trang web nhắn tin trực tuyến

## 1. Mục tiêu

- Đảm bảo chỉ người gửi và người nhận có thể đọc nội dung tin nhắn
- Ngăn chặn server, admin, và bên thứ ba truy cập nội dung tin nhắn
- Bảo vệ quyền riêng tư người dùng ngay cả khi database bị xâm nhập
- Triển khai mã hóa E2E trong suốt, không ảnh hưởng đến trải nghiệm người dùng

## 2. Các đối tượng tham gia

### 2.1. Người dùng A (Người gửi)

- Khởi tạo cuộc trò chuyện
- Gửi tin nhắn đã mã hóa

### 2.2. Người dùng B (Người nhận)

- Nhận và giải mã tin nhắn
- Có thể trả lời (trở thành người gửi)

### 2.3. Server

- Lưu trữ tin nhắn đã mã hóa
- Phân phối tin nhắn đến người nhận
- Quản lý public keys của người dùng
- **KHÔNG có khả năng giải mã tin nhắn**

### 2.4. Client Application (Browser/App)

- Thực hiện mã hóa/giải mã trên thiết bị
- Quản lý private key của người dùng
- Sử dụng Web Crypto API

## 3. Kịch bản chi tiết

### 3.1. Khởi tạo - Đăng ký tài khoản

```
Bước 1: Người dùng đăng ký tài khoản
├─ Client: Sinh cặp khóa RSA/ECDH (public key + private key)
│  └─ Sử dụng Web Crypto API
│  └─ Key size: RSA-2048 hoặc ECDH P-256
├─ Client: Lưu private key vào IndexedDB (có mã hóa bằng password)
├─ Client: Gửi public key lên server
└─ Server: Lưu public key vào database (liên kết với user_id)

Lưu ý:
- Private key KHÔNG BAO GIỜ rời khỏi thiết bị
- Private key được mã hóa bằng key dẫn xuất từ password người dùng
```

### 3.2. Bắt đầu cuộc trò chuyện mới

```
Bước 1: User A muốn nhắn tin cho User B
├─ Client A: Yêu cầu public key của User B từ server
├─ Server: Trả về public key của User B
└─ Client A: Lưu public key của User B vào memory/cache

Bước 2: Thiết lập session key (khuyến nghị)
├─ Client A: Sinh symmetric session key (AES-256)
├─ Client A: Mã hóa session key bằng public key của User B
├─ Client A: Gửi encrypted session key lên server
└─ Server: Forward encrypted session key đến User B
    └─ User B: Giải mã session key bằng private key của mình
```

### 3.3. Gửi tin nhắn

```
User A gửi tin nhắn "Hello World"

Bước 1: Mã hóa tin nhắn
├─ Client A: Lấy plaintext = "Hello World"
├─ Client A: Nếu có session key:
│  └─ Mã hóa bằng AES-256-GCM với session key
│  └─ encryptedMessage = encrypt(plaintext, sessionKey)
├─ Client A: Nếu không có session key:
│  └─ Mã hóa trực tiếp bằng public key của User B
│  └─ encryptedMessage = encrypt(plaintext, publicKeyB)
└─ Client A: Tạo metadata
   ├─ timestamp
   ├─ messageId
   └─ iv (initialization vector cho AES)

Bước 2: Gửi lên server
├─ Client A gửi:
│  ├─ encryptedMessage (base64)
│  ├─ senderId: userA_id
│  ├─ recipientId: userB_id
│  ├─ metadata (timestamp, iv, etc.)
│  └─ signature (optional - ký bằng private key A để xác thực)
└─ Server: Lưu vào database
   └─ Server KHÔNG thể đọc encryptedMessage

Bước 3: Phân phối đến người nhận
├─ Server: Kiểm tra User B có online không
├─ Nếu online:
│  └─ Push tin nhắn qua WebSocket/Socket.io
└─ Nếu offline:
   └─ Lưu vào queue, gửi khi User B online
```

### 3.4. Nhận và giải mã tin nhắn

```
User B nhận tin nhắn

Bước 1: Client B nhận encrypted message từ server
├─ Nhận qua WebSocket (realtime)
└─ Hoặc fetch từ API khi mở app

Bước 2: Giải mã
├─ Client B: Lấy private key từ IndexedDB
├─ Client B: Nếu dùng session key:
│  └─ decryptedMessage = decrypt(encryptedMessage, sessionKey, iv)
├─ Client B: Nếu mã hóa trực tiếp:
│  └─ decryptedMessage = decrypt(encryptedMessage, privateKeyB)
└─ Client B: Verify signature (nếu có)
   └─ Xác nhận tin nhắn thực sự từ User A

Bước 3: Hiển thị
└─ Render "Hello World" lên UI
```

### 3.5. Đồng bộ đa thiết bị

```
User A đăng nhập trên thiết bị mới

Bước 1: Yêu cầu đồng bộ private key
├─ Option 1: Backup/Restore
│  ├─ User export encrypted private key từ thiết bị cũ
│  ├─ Import vào thiết bị mới
│  └─ Nhập password để giải mã
│
├─ Option 2: QR Code pairing
│  ├─ Thiết bị mới tạo temporary public key
│  ├─ Thiết bị cũ scan QR, mã hóa private key
│  └─ Transfer qua server hoặc local network
│
└─ Option 3: Cloud backup (encrypted)
   ├─ Private key được mã hóa với master password
   ├─ Lưu lên server (server không thể giải mã)
   └─ Thiết bị mới download và giải mã

Lưu ý: Cần giáo dục user về rủi ro mất private key
```

## 4. Trường hợp ngoại lệ

### 4.1. User mất private key

```
Vấn đề: Không thể giải mã tin nhắn cũ
Giải pháp:
├─ Cảnh báo user trước khi xóa app/clear data
├─ Khuyến khích backup private key
├─ Hiển thị tin nhắn "[Tin nhắn đã mã hóa - Không thể giải mã]"
└─ Tạo cặp khóa mới, chỉ áp dụng cho tin nhắn mới
```

### 4.2. User đổi password

```
Vấn đề: Private key được mã hóa bằng password cũ
Giải pháp:
├─ Giải mã private key bằng password cũ
├─ Mã hóa lại private key bằng password mới
└─ Lưu lại vào IndexedDB
Lưu ý: Public key KHÔNG đổi
```

### 4.3. Public key của người nhận bị thay đổi

```
Vấn đề: Có thể là MITM attack
Giải pháp:
├─ Hiển thị cảnh báo "Public key đã thay đổi"
├─ Yêu cầu xác minh qua kênh khác (QR code, safety number)
├─ User xác nhận mới tiếp tục
└─ Log event để phát hiện bất thường
```

### 4.4. Server bị tấn công

```
Kịch bản: Hacker chiếm được database
Kết quả:
├─ Hacker thấy: encryptedMessages, metadata, userIds
├─ Hacker KHÔNG thấy: plaintext messages
└─ E2E encryption vẫn bảo vệ nội dung tin nhắn

Lưu ý: Metadata vẫn lộ (ai nhắn ai, khi nào, bao nhiêu tin)
```

### 4.5. Browser không hỗ trợ Web Crypto API

```
Giải pháp:
├─ Phát hiện browser capabilities khi load app
├─ Fallback: Sử dụng library như crypto-js
├─ Hoặc: Yêu cầu update browser
└─ Tối thiểu: Chrome 37+, Firefox 34+, Safari 11+
```

### 4.6. Tin nhắn quá lớn

```
Vấn đề: RSA không thể mã hóa data lớn trực tiếp
Giải pháp:
├─ Luôn dùng hybrid encryption
├─ Dùng AES-256 mã hóa nội dung
├─ Dùng RSA chỉ để mã hóa AES key
└─ Với file lớn: Tách thành chunks, mã hóa từng phần
```

### 4.7. User block hoặc xóa account

```
User B xóa account:
├─ Server xóa public key của User B
├─ User A không gửi được tin nhắn mới
├─ Tin nhắn cũ vẫn giữ nguyên (đã mã hóa)
└─ User A: Hiển thị "User không tồn tại"
```

## 5. Kết quả mong đợi

### 5.1. Bảo mật

- ✅ Server không thể đọc nội dung tin nhắn
- ✅ Database leak không làm lộ plaintext
- ✅ Chỉ người gửi và người nhận có thể đọc tin nhắn
- ✅ Forward secrecy (nếu dùng session key rotation)
- ✅ Xác thực nguồn gốc tin nhắn (qua signature)

### 5.2. Hiệu năng

- ✅ Mã hóa/giải mã < 100ms cho tin nhắn text
- ✅ Session key giúp tăng tốc độ
- ✅ Caching public keys giảm request đến server
- ✅ Batch encryption cho nhiều tin nhắn

### 5.3. Trải nghiệm người dùng

- ✅ Transparent encryption - user không cần thao tác thêm
- ✅ Hiển thị indicator "tin nhắn đã mã hóa" (badge/icon)
- ✅ Smooth onboarding - tự động sinh key
- ✅ Backup/restore workflow rõ ràng
- ✅ Warning khi có rủi ro bảo mật

### 5.4. Khả năng mở rộng

- ✅ Hỗ trợ group chat (shared symmetric key)
- ✅ Mã hóa file đính kèm
- ✅ Voice/video call encryption
- ✅ Tương thích đa nền tảng (web, mobile, desktop)

### 5.5. Compliance

- ✅ Tuân thủ GDPR (user control data)
- ✅ Zero-knowledge architecture
- ✅ Audit log cho key rotation
- ✅ Transparent về cách hoạt động của E2E

---

## Tech Stack đề xuất (JavaScript/TypeScript/Node.js)

### Client-side:

```typescript
- Web Crypto API (native)
- SubtleCrypto interface
- IndexedDB (idb library)
- Socket.io-client (realtime)
```

### Server-side:

```typescript
- Node.js + Express/Fastify
- Socket.io (WebSocket)
- PostgreSQL/MongoDB (lưu encrypted messages)
```

### Libraries:

```typescript
- @noble/curves (ECDH)
- @noble/hashes (hashing)
- tweetnacl-js (alternative crypto)
- buffer (Node.js buffer trong browser)
```

Bạn có muốn tôi viết code mẫu cho bất kỳ phần nào trong kịch bản này không?
