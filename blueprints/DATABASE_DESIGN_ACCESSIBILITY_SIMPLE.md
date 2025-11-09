# DATABASE DESIGN: ACCESSIBILITY FOR BLIND USERS (SIMPLIFIED VERSION)

## 🎯 Mục tiêu

Thiết kế database tối giản để hỗ trợ người khiếm thị nhắn tin qua **giọng nói**, **âm thanh** và **bàn phím**.

---

## 📊 THAY ĐỔI SCHEMA

### 1. **UserSettings** - Thêm 4 fields accessibility cơ bản

```prisma
model UserSettings {
    // ... existing fields ...

    // Accessibility - Simplified
    ttsEnabled       Boolean @default(false) // Bật Text-to-Speech
    autoReadMessages Boolean @default(false) // Tự động đọc tin mới
    speechRate       Float   @default(1.0)   // Tốc độ đọc (0.5 - 2.0)
    sttEnabled       Boolean @default(false) // Bật Speech-to-Text
}
```

**Lý do đơn giản hóa:**

- Chỉ giữ 4 settings quan trọng nhất
- Các settings khác (volume, pitch, voice) có thể dùng default hoặc xử lý ở frontend
- Có thể mở rộng sau khi có feedback thực tế từ users

---

### 2. **Message** - Thêm fields cho voice messages

```prisma
model Message {
    // ... existing fields ...

    // Voice message support
    transcript     String?  @db.Text        // Transcript của voice note
    audioDuration  Int?                     // Duration (seconds)
    hasVoiceNote   Boolean  @default(false) // Quick flag

    @@index([transcript]) // Search transcript
}
```

**Use case:**

- User gửi voice note → STT tạo transcript
- Người nhận có thể đọc transcript hoặc nghe audio
- Search trong transcript

---

### 3. **MessageMedia** - Thêm alt-text cho images

```prisma
model MessageMedia {
    // ... existing fields ...

    // Image accessibility
    altText              String?  @db.Text    // User-provided
    aiGeneratedAltText   String?  @db.Text    // AI-generated
    aiConfidenceScore    Float?               // 0.0 - 1.0
    isAltTextValidated   Boolean  @default(false)

    @@index([type])
}
```

**Use case:**

- Upload ảnh → AI tạo alt-text tự động
- User có thể edit/confirm
- Screen reader đọc alt-text cho người mù

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: MVP (2 tuần)**

#### Week 1: Backend Core

1. ✅ Update Prisma schema (DONE)
2. [ ] Migration: `npx prisma migrate dev --name add_accessibility_basic`
3. [ ] Tạo Speech Service (STT/TTS endpoints)
4. [ ] Update Chat Service: handle voice messages

#### Week 2: Frontend Core

1. [ ] Voice Input Component (MediaRecorder API)
2. [ ] Auto-read Messages (Web Speech API)
3. [ ] Settings UI (4 toggles + speech rate slider)
4. [ ] Keyboard shortcuts (G, N, R, P)

---

### **Phase 2: AI Support (1 tuần)**

1. [ ] AI Alt-text Generation (OpenAI Vision)
2. [ ] Upload image validation
3. [ ] Alt-text display in messages

---

### **Phase 3: Polish (1 tuần)**

1. [ ] Audio feedback (earcons) - hardcoded sounds
2. [ ] Offline queue
3. [ ] Testing với NVDA/VoiceOver
4. [ ] Documentation

---

## 📝 MIGRATION SQL

```sql
-- UserSettings: Add accessibility fields
ALTER TABLE user_settings
  ADD COLUMN tts_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN auto_read_messages BOOLEAN DEFAULT FALSE,
  ADD COLUMN speech_rate FLOAT DEFAULT 1.0,
  ADD COLUMN stt_enabled BOOLEAN DEFAULT FALSE;

-- Message: Add voice note support
ALTER TABLE messages
  ADD COLUMN transcript TEXT,
  ADD COLUMN audio_duration INTEGER,
  ADD COLUMN has_voice_note BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_messages_transcript ON messages(transcript);

-- MessageMedia: Add alt-text
ALTER TABLE message_medias
  ADD COLUMN alt_text TEXT,
  ADD COLUMN ai_generated_alt_text TEXT,
  ADD COLUMN ai_confidence_score FLOAT,
  ADD COLUMN is_alt_text_validated BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_message_medias_type ON message_medias(type);
```

---

## 🎯 USE CASES

### 1. User bật TTS lần đầu

```typescript
// Frontend
await updateSettings({
  ttsEnabled: true,
  autoReadMessages: true,
  speechRate: 1.0
});

// Backend update
UPDATE user_settings
SET tts_enabled = true,
    auto_read_messages = true,
    speech_rate = 1.0
WHERE user_id = 123;
```

---

### 2. User gửi voice message

```typescript
// 1. Frontend record audio → upload to S3
const audioFile = await recordAudio();
const s3Url = await uploadToS3(audioFile);

// 2. Create message với hasVoiceNote = true
const message = await createMessage({
  content: "[Voice Note]",
  type: "MEDIA",
  mediaId: mediaRecord.id,
  hasVoiceNote: true,
  audioDuration: 45, // seconds
});

// 3. Backend gọi STT service (async)
const transcript = await speechService.transcribe(s3Url);

// 4. Update message với transcript
await updateMessage(message.id, {
  transcript: "Hẹn 7h tối nhé",
});
```

---

### 3. User upload ảnh → AI tạo alt-text

```typescript
// 1. Upload image
const imageUrl = await uploadToS3(imageFile);

// 2. Gọi AI để generate alt-text
const altText = await openai.vision.analyze(imageUrl);
// => "Hóa đơn bữa tối, tổng 350.000 VND"

// 3. Create media record
await createMessageMedia({
  url: imageUrl,
  type: "IMAGE",
  aiGeneratedAltText: altText,
  aiConfidenceScore: 0.92,
});

// 4. User có thể edit alt-text
await updateMessageMedia(mediaId, {
  altText: "Hóa đơn nhà hàng ABC, 350k",
  isAltTextValidated: true,
});
```

---

## 💡 FRONTEND INTEGRATION

### TTS (Text-to-Speech)

```typescript
// Use Web Speech API (built-in browser)
const speak = (text: string, rate: number = 1.0) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

// Auto-read new messages
socket.on("new_message", (message) => {
  if (userSettings.autoReadMessages) {
    speak(`${message.author}: ${message.content}`, userSettings.speechRate);
  }
});
```

---

### STT (Speech-to-Text)

```typescript
// Use MediaRecorder + WebSocket to backend
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = async (event) => {
    // Stream audio chunks to backend
    socket.emit("audio_chunk", event.data);
  };

  // Receive transcript from backend
  socket.on("transcript_chunk", (text) => {
    setTranscript((prev) => prev + text);
  });

  mediaRecorder.start(1000); // 1 second chunks
};
```

---

### Keyboard Shortcuts

```typescript
// Global keyboard handler
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    // G - Focus input
    if (e.key === "g" && !e.ctrlKey && !e.altKey) {
      document.getElementById("message-input")?.focus();
    }

    // N - Next unread
    if (e.key === "n") {
      navigateToNextUnread();
    }

    // R - Reply
    if (e.key === "r") {
      document.getElementById("message-input")?.focus();
    }

    // P - Play audio message
    if (e.key === "p") {
      playCurrentAudioMessage();
    }
  };

  window.addEventListener("keydown", handleKeyboard);
  return () => window.removeEventListener("keydown", handleKeyboard);
}, []);
```

---

## 🔧 TECH STACK CHO MVP

### Frontend

- ✅ Next.js (đang dùng)
- ✅ Web Speech API (built-in browser) - TTS/STT
- ✅ MediaRecorder API (built-in browser) - Record audio
- ✅ WebSocket (đang có) - Realtime

### Backend

- ✅ NestJS (đang dùng)
- [ ] AWS Transcribe Streaming - STT production
- [ ] AWS Polly - TTS production (optional, có thể dùng Web Speech)
- [ ] OpenAI Vision API - Alt-text generation

### Database

- ✅ PostgreSQL (đang dùng)
- ✅ Prisma (đang dùng)

---

## 📦 DEPENDENCIES CẦN CÀI

### Backend (Speech Service)

```bash
npm i @aws-sdk/client-transcribe-streaming  # STT
npm i @aws-sdk/client-polly                 # TTS (optional)
npm i openai                                # Alt-text
```

### Frontend (Next.js)

```bash
# Không cần cài gì thêm!
# Web Speech API, MediaRecorder API đã có sẵn trong browser
```

---

## ⚠️ NOTES

### Tại sao đơn giản hóa?

1. **UserSettings thay vì AccessibilityPreferences riêng:**
   - Ít join queries
   - Dễ maintain
   - Có thể mở rộng sau

2. **Không tạo bảng VoiceCommands/KeyboardShortcuts riêng:**
   - Hardcode shortcuts ở frontend (G, N, R, P)
   - Đơn giản, nhanh
   - Sau này mới cho custom

3. **Không log SpeechSessions:**
   - MVP không cần analytics
   - Tránh phức tạp và tốn storage
   - Thêm sau khi có users thực

4. **Không tạo bảng MessageSummarization riêng:**
   - Gọi OpenAI on-demand
   - Không cache (giảm complexity)
   - Cache sau khi thấy cần

5. **Alt-text AI optional:**
   - User có thể bỏ qua
   - Không bắt buộc phải có OpenAI ngay
   - Có thể dùng fallback: "Image"

---

## 🎯 SUCCESS CRITERIA

### MVP chạy được khi:

- [x] Schema updated
- [ ] User bật được TTS và nghe tin mới
- [ ] User gửi được voice note và thấy transcript
- [ ] User upload ảnh và thấy AI alt-text (hoặc manual input)
- [ ] 4 keyboard shortcuts hoạt động (G, N, R, P)

---

## 🚀 NEXT STEPS

1. **Chạy migration:**

   ```bash
   cd call-service
   npx prisma migrate dev --name add_accessibility_simple
   ```

2. **Copy schema sang services khác:**

   ```bash
   # Copy to user-auth, chat, conversation services
   cp call-service/prisma/schema.prisma user-auth-service/prisma/
   cp call-service/prisma/schema.prisma chat-service/prisma/
   cp call-service/prisma/schema.prisma conversation-service/prisma/
   ```

3. **Implement Speech Service** (backend)

4. **Implement Voice Input Component** (frontend)

---

**Version:** Simplified MVP
**Ước tính:** 4 tuần full-time (1 dev)
**Có thể demo:** Sau 2 tuần
