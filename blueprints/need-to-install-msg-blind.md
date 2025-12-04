Dưới đây là danh sách **tối thiểu – nhưng đầy đủ** các thành phần bạn cần cài đặt trong môi trường Windows 11 + Chrome để triển khai **ứng dụng nhắn tin dành cho người mù** dựa trên **giọng nói – bàn phím – âm thanh**. Tôi phân tách rõ theo: _phát triển_, _test người mù_, và _hỗ trợ STT/TTS thời gian thực_.

---

# 1. Các phần mềm **bắt buộc** cho môi trường phát triển

### 1. Node.js + npm/yarn/pnpm

- Dùng để chạy backend (Node.js) và build frontend (React/Next/Vite).
- Cần phiên bản LTS (18 hoặc 20).
- Bạn đang làm web với React/Node/Nest nên cái này là nền tảng.

### 2. Visual Studio Code

- Bạn đang dùng rồi, nhưng cần bật một số extension:
  - VSCode Accessibility Checker (tùy chọn).
  - ESLint + Prettier để kiểm soát lỗi UI/ARIA.
  - VSCode Speech hoặc Live Preview nếu bạn muốn test giọng trực tiếp trong editor.

### 3. Git

- Quản lý mã nguồn.
- Không liên quan trực tiếp đến người mù nhưng cần cho quy trình dự án.

---

# 2. Phần mềm **bắt buộc** để tạo và kiểm thử tính năng dành cho người mù

Đây là phần quan trọng nhất. Bạn cần tối thiểu 1 trình đọc màn hình thực tế để test hành vi, vì người mù dùng app theo cách hoàn toàn khác.

### 1. **NVDA (khuyến nghị – miễn phí)**

- Trình đọc màn hình chuẩn cho Windows.
- Cho phép test:
  - Cách ứng dụng đọc tiêu đề, nút bấm, text thay đổi.
  - Ứng xử khi có tin nhắn mới.
  - Focus order, role/ARIA, keyboard shortcuts.

- Bạn sẽ phải test các trường hợp:
  - Người dùng mở app.
  - Tin nhắn đến → NVDA phải đọc chính xác.
  - Người dùng nhấn phím để mở hộp thoại ghi âm.
  - Kết thúc nói → hệ thống gửi và screen reader đọc lại.

### 2. **Windows Narrator**

- Có sẵn trong Windows 11.
- Không mạnh bằng NVDA nhưng dùng để cross-check.

### 3. **ChromeVox (nếu cần kiểm thử cross-browser Chrome)**

- Extension của Google dành riêng cho Chrome.
- Hữu ích để kiểm tra các hành vi khác với NVDA.

---

# 3. Công cụ bắt buộc để hỗ trợ **giọng nói (STT) thời gian thực**

Bạn không nhất thiết phải cài phần mềm desktop, nhưng cần:

### 1. Cài **WSL2 / Docker Desktop** (nếu bạn muốn test STT on-prem)

- Nếu bạn định test Deepgram / Speechmatics bản self-hosted / local inference thì cần Docker.
- Nếu bạn chỉ dùng dịch vụ cloud (Deepgram, AssemblyAI, Speechmatics), bạn **không cần cài gì** ngoài Node.js.

### 2. OpenSSL trên Windows (nếu backend cần HTTPS local)

- Khi làm WebRTC hoặc audio streaming secure, bạn sẽ cần self-signed certificate.
- Chrome đôi khi yêu cầu HTTPS ngay cả khi chạy local khi bạn yêu cầu quyền audio.

---

# 4. Phần mềm phục vụ xử lý âm thanh / micro để kiểm thử

### 1. VoiceMeeter Banana (tùy chọn nhưng rất hữu ích)

- Cho phép bạn:
  - Route âm thanh test vào micro ảo.
  - Test app trong các trường hợp người dùng khó khăn.
  - Kiểm soát tiếng ồn và mức âm lượng khi thử STT.

### 2. Audacity (tùy chọn)

- Thu âm để test chất lượng input.
- Kiểm thử trường hợp tiếng ồn nền.

---

# 5. Extension hoặc công cụ hỗ trợ phát triển Frontend dành cho người mù

### 1. Chrome DevTools Accessibility Panel (có sẵn)

- Kiểm tra:
  - role
  - ARIA
  - Contrast
  - Tab order

### 2. Lighthouse (có sẵn trong Chrome)

- Chạy báo cáo Accessibility.

### 3. Axe DevTools (extension)

- Công cụ kiểm tra accessibility chuyên nghiệp (miễn phí bản cơ bản).

---

# 6. Phần mềm để test Text-to-Speech (TTS)

Bạn không cần cài phần mềm riêng, vì:

- **Windows 11** đã có “Windows TTS voices”.
- **Chrome** có Web Speech API (speechSynthesis).
- Các provider như Deepgram/Speechmatics/AssemblyAI dùng qua API → không cần cài gì.

Nếu muốn test TTS nâng cao:

- Bạn có thể cài thêm **Balabolka** để so sánh chất lượng TTS offline.

---

# 7. Các thiết bị ngoại vi bạn bắt buộc nên có

Không phải phần mềm, nhưng quan trọng cho test thực tế:

1. **Tai nghe có micro tốt**
2. **Microphone rời** (để test noise)
3. **Một điện thoại Android/iOS** để test PWA hoặc web version có screen reader:
   - TalkBack (Android)
   - VoiceOver (iOS)

---

# 8. Danh sách tổng hợp (ngắn gọn)

Dành cho Windows 11 + Chrome, để xây app nhắn tin cho người mù:

## Bắt buộc

- Node.js (LTS)
- VSCode
- Git
- NVDA
- Chrome DevTools + Lighthouse
- Backend server + STT API provider (không cần cài gì trên máy)

## Nên có

- Docker Desktop (test on-prem STT)
- WSL2
- Axe DevTools (extension)
- Audacity hoặc VoiceMeeter để test âm thanh
- Thiết bị di động để test screen reader thực tế

---

Nếu bạn muốn, tôi có thể lập một **checklist hoàn chỉnh** để bạn vừa lập trình vừa đánh dấu từng bước (ARIA, STT, hotkey, focus management), hoặc tạo **môi trường mẫu** (template React/Nest) để bạn chạy được STT realtime + thông báo bằng giọng nói tương thích NVDA.
