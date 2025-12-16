VOICE ASSISTANT — MOCKDOWN LUỒNG HOẠT ĐỘNG

Tổng quan ngắn: tài liệu này mô tả luồng hoạt động (inputs → xử lý → outputs) cho các file trong `voice-assistant` của service: controllers, `voice-assistant.service.ts`, handlers và các services (`llm`, `stt`, `tts`). Mỗi mục liệt kê hàm chính, tham số, các cuộc gọi nội bộ/DB/ngoại vi và kết quả trả về.

---

**1) Controllers (entrypoints)**

`voice-assistant.controller.ts` (HTTP) / `voice-assistant-grpc.controller.ts` (gRPC)

- Endpoints chính:
  - `processVoiceCommand(payload)`
    - Input: audio blob / text, `userId`, metadata
    - Steps: nhận request -> validate -> gọi `voiceAssistantService.processCommand(userId, payload)`
    - Output: immediate ack hoặc result object (confirmation, error)
  - `health` / `ping` (simple check)
- Error handling: trả lỗi HTTP/gRPC nếu validation hoặc xử lý chính thất bại.

---

**2) Core orchestration — `voice-assistant.service.ts`**

Hàm/flow chính (ví dụ tên giả định):

- `processCommand(userId, payload)`
  - Input: `userId`, `payload` (audio | text | intent)
  - Steps:
    1. Nếu payload là audio: gọi `sttService.transcribe(audio)` → nhận `text`.
    2. Gửi `text` tới `llmService.extractIntent(text)` → nhận `intent`, `params` (ví dụ: contactName, action)
    3. Tùy `intent` chuyển xuống các handler tương ứng:
       - message → `messageHandler.readLatestMessages()` hoặc `messageHandler.prepareSendMessage()`
       - call → `callHandler.prepareCallUser()`
       - group → `groupHandler.*`
       - user/sticker → `userHandler` / `stickerHandler`
    4. Handler thực hiện DB/gRPC call để lấy dữ liệu cần thiết (messages, userId, directChatId, groupId)
    5. Nếu cần trả âm thanh: gọi `ttsService.synthesize(text)` → trả audio stream hoặc URL
  - Output: structured result (confirmation text / audio / error)

- `handleDirectIntent(...)` (internal helper)
  - Steps: resolve contact via `fuzzySearchService.fuzzyFindContact(userId, contactName)` → route based on returned `type` (direct/group)

Notes:

- `processCommand` là central router; mọi luồng voice → stt → llm → handlers → tts đều đi qua đây.

---

**3) Handlers — mô tả từng file**

A. `message-handler.service.ts`

- Hàm chính:
  - `readLatestMessages(userId, contactName?, options?)`
    - Input: `userId`, optional `contactName` (string), pagination/filter options
    - Steps:
      1. Nếu `contactName` có: gọi `fuzzySearchService.fuzzyFindContact(userId, contactName)`
         - Nếu null: return error message "Không tìm thấy [contactName]"
         - Nếu type = 'direct' → lấy `directChatId`
         - Nếu type = 'group' → lấy `groupId`
      2. Với chatId/groupId query `prisma.message.findMany(...)` (lọc theo time, isMyMessages nếu có)
      3. Format messages (truncate/summary) → nếu cần đọc thì trả text cho `ttsService`
    - Output: array messages hoặc synthesized audio

  - `prepareSendMessage(userId, contactName, content)`
    - Input: `userId`, `contactName`, `content` (text)
    - Steps:
      1. `fuzzyFindContact` để resolve target
      2. Nếu direct: create message record in `directChat` or call Chat service via gRPC
      3. If group: insert to group messages
      4. Return confirmation text

Notes: `readLatestMessages` và `prepareSendMessage` dùng `fuzzyFindContact` để map tên nói sang ID chat/group.

B. `group-handler.service.ts`

- Hàm chính:
  - `prepareCreateGroupMessage(userId, groupName?, content)`
    - Steps:
      1. Nếu `groupName` là tên nói: gọi `fuzzyFindContact(userId, groupName)` → ưu tiên match group
      2. Nếu groupId: insert message vào `groupMessage` table
      3. Notify group members (gọi Notification service nếu cần)
    - Output: confirmation

  - `prepareAddMember(userId, groupName, memberName)`
    - Steps:
      1. Resolve `groupId` via `fuzzyFindContact(userId, groupName)` (type=group expected)
      2. Resolve `member` via `fuzzyFindContact(userId, memberName)` (type=direct expected -> get recipientId)
      3. Add member to group (prisma.groupMember.create)
      4. Return confirmation

C. `call-handler.service.ts`

- Hàm chính:
  - `prepareCallUser(userId, contactName, callOptions)`
    - Steps:
      1. `fuzzyFindContact(userId, contactName)` → expect direct match
      2. With directChatId → find recipientId or userId from directChat entry
      3. Create call session (DB or call CallService via gRPC)
      4. Return call metadata (session id, callee info)

  - `startCallSession(sessionInfo)`
    - Steps: interact with Agora / Call microservice via gRPC (create channel, tokens)

D. `sticker-handler.service.ts`

- Hàm chính:
  - `sendSticker(userId, contactName, stickerId)`
    - Steps:
      1. Resolve recipient via `fuzzyFindContact` (direct or group)
      2. Insert sticker message record
      3. Notify recipients

E. `user-handler.service.ts`

- Hàm chính:
  - `getUserProfile(userId, targetName?)`
    - Steps:
      1. If `targetName` present → `fuzzyFindContact(userId, targetName)` (direct expected)
      2. Fetch profile via `prisma.user.findUnique(...)` or User microservice via gRPC
      3. Return profile summary (for TTS reading or confirmation)

---

**4) Services (external integrations & AI helpers)**

A. `llm.service.ts` (LangChain/OpenAI wrapper)

- Hàm chính:
  - `extractIntent(text)`
    - Input: raw `text` (Vietnamese)
    - Steps:
      1. Normalize text
      2. Call LLM (OpenAI / Google) with prompt template to extract `intent` and `entities` (contactName, action, time)
      3. Return structured `{ intent, params }`
    - Output: structured intent object used by `voice-assistant.service`

  - `generateReply(context)`
    - Steps: call LLM to create natural confirmation/response to user

B. `stt.service.ts` (Deepgram or equivalent)

- Hàm chính:
  - `transcribe(audioBlob)`
    - Steps: upload audio to STT API → receive `text` + confidence
    - Post-process: punctuation, remove wake-word, lowercasing
    - Return `text`

C. `tts.service.ts` (Google TTS / cloud)

- Hàm chính:
  - `synthesize(text, options)`
    - Steps: call cloud TTS → get audio buffer or URL
    - Cache short audio outputs (optional)
    - Return `audioBuffer` or stream URL

---

**5) Utils used xuyên suốt**

`fuzzy-search.service.ts`

- Hàm chính: `fuzzyFindContact(userId, name)`
  - Steps (tóm tắt):
    1. Query Groups where `userId` is member → compute similarity against `name` → if best match >= threshold (0.4) return group
    2. Else query Friends + DirectChats → build contact list (fullName + directChatId) → compute similarity → return best direct contact if >= threshold
    3. Nếu không tìm thấy → return null
  - Return object: `{ type: 'direct'|'group', directChatId?, groupId?, fullName }`

**Ghi chú:** handlers gọi utility này rất thường xuyên để map tên nói sang ID cần thiết cho DB/gRPC operations.

---

**6) Luồng mẫu end-to-end (3 use-cases ngắn)**

Use-case A — "Đọc tin nhắn từ Tuấn":

1. Controller nhận audio
2. `sttService.transcribe(audio)` → text "đọc tin nhắn từ tuan"
3. `llmService.extractIntent(text)` → { intent: 'read_messages', params: { contactName: 'tuan' } }
4. `voiceAssistantService.processCommand(...)` → gọi `messageHandler.readLatestMessages(userId, 'tuan')`
5. `messageHandler` → `fuzzyFindContact(userId, 'tuan')` → returns direct with `directChatId`
6. Query messages → format → `ttsService.synthesize` → trả audio

Use-case B — "Gọi cho Lan":

1. STT + LLM → intent: call, contactName: 'Lan'
2. `callHandler.prepareCallUser` → `fuzzyFindContact` → get recipientId
3. Create call session + call CallService/generate Agora tokens
4. Return confirmation / initiate call

Use-case C — "Thêm Minh vào nhóm Marketing":

1. Extract groupName = 'Marketing', memberName = 'Minh'
2. `groupHandler.prepareAddMember`:
   - Resolve group via `fuzzyFindContact(userId, 'Marketing')` (group)
   - Resolve 'Minh' via `fuzzyFindContact(userId, 'Minh')` (direct → get userId)
   - Add to group members
   - Notify via Notification service

---

**7) Lưu ý vận hành / lỗi phổ biến**

- `fuzzyFindContact` có threshold ~0.4 — tên quá ngắn/không rõ sẽ trả null → handlers phải xử lý case này (ask user to repeat).
- Latency considerations: audio -> STT -> LLM -> DB can gây chậm; handlers nên trả ACK sớm nếu cần.
- Multi-match ambiguity: nếu similarity gần nhau, hiện tại hệ thống chọn best match; có thể mở confirm dialog ("Bạn muốn [A] hay [B]").

---

Nếu muốn, tôi có thể:

- Tạo file này trong folder `voice-assistant-service/docs/` (hiện đã tạo tại root service)
- Vẽ sơ đồ sequence (Mermaid) cho 2-3 use-case chính
- Bóc chi tiết từng hàm trong mã nguồn (`line-by-line`) — nếu cần chỉ định file nào trước
