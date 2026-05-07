# System Workflows

## 1. Workflow Philosophy

- Tập trung vào MVP thực tế, tránh enterprise flow phức tạp.
- Mọi flow xoay quanh vòng học cốt lõi: `Chat -> Flashcard -> Quiz -> Progress`.
- Ưu tiên:
  - latency thấp cho chat
  - data flow rõ giữa FE/BE/AI/DB
  - tracking analytics đủ để đo retention và conversion.
- Workflow phải hỗ trợ cả `registered user` và `guest user`.

## 2. User Journey Overview

1. User vào app -> đăng nhập hoặc vào guest.
2. User mới hoàn tất onboarding.
3. Vào dashboard -> bấm Continue Chat.
4. Chat ở Knowledge (mặc định), có thể đổi Roleplay realtime.
5. Từ chat, AI gợi ý/tạo flashcard.
6. User review flashcard bằng swipe.
7. User làm quiz (daily hoặc manual).
8. Progress cập nhật và hiển thị lại trên dashboard.
9. Guest hết quota -> signup -> merge dữ liệu guest.

## 3. Authentication Workflows

### Trigger
- User chọn `Google login` hoặc `email/password`.

### Actors involved
- User, Frontend, Backend Auth API, MongoDB.

### Frontend actions
- Gửi request `POST /auth/google` hoặc `POST /auth/login|signup`.
- Lưu access token/session state.
- Điều hướng đến dashboard khi thành công.

### Backend actions
- Xác thực credential/OAuth token.
- Tạo mới user nếu chưa tồn tại.
- Trả token + profile tóm tắt.

### AI actions
- Không có.

### Database updates
- `users`: tạo/cập nhật `auth_provider`, `email`, `google_id`, `last_login` (nếu có).

### Analytics events
- `signup_completed` (khi đăng ký thành công).

### Possible failures
- Email trùng, password sai, OAuth fail.

### Fallback behavior
- FE hiển thị lỗi ngắn gọn + cho thử lại.
- BE trả mã lỗi rõ (`401/409/422`).

## 4. Onboarding Workflows

### Trigger
- User đăng nhập lần đầu hoặc `onboarding_completed=false`.

### Actors involved
- User, Frontend onboarding UI, Backend profile API, MongoDB.

### Frontend actions
- Thu 4 bước: level, goal, target score, favorite topics.
- Gửi `POST /onboarding`.

### Backend actions
- Validate input.
- Lưu vào user profile.

### AI actions
- Chưa gọi AI trực tiếp; dữ liệu này dùng cho prompt ở các flow sau.

### Database updates
- `users`: `current_level`, `target_exam`, `target_score`, `learning_goals`, `favorite_topics`, `onboarding_completed=true`.

### Analytics events
- `onboarding_started`, `onboarding_complete`.

### Possible failures
- Target score không hợp lệ, payload thiếu field.

### Fallback behavior
- FE giữ dữ liệu form hiện tại, highlight field lỗi.
- BE trả lỗi validation cụ thể.

Need clarification:
- Rule validation chuẩn cho `target_score` theo từng exam.

## 5. Knowledge Chat Workflow

### Trigger
- User gửi message trong mode `knowledge`.

### Actors involved
- User, Frontend chat UI, Backend chat service, AI model, MongoDB.

### Frontend actions
- Gửi `POST /chat/message` với `mode=knowledge`.
- Hiển thị loading state.
- Render response + nút `Explain more` khi nhận kết quả.

### Backend actions
- Xác thực user/guest session.
- Nạp runtime context: onboarding, recent_messages, weak_topics, target info.
- Chọn prompt template Knowledge.
- Gọi AI API.
- Lưu user message + assistant message.
- Chạy detect flashcard candidates (nhanh, không block UI nếu cần).

### AI actions
- Sinh phản hồi concise-first.
- Ưu tiên format: giải thích ngắn -> cấu trúc -> ví dụ.
- Adapt theo level/target exam.

### Database updates
- `chat_sessions`: cập nhật `current_mode`, `updated_at`, `message_count`.
- `chat_messages`: thêm message user + assistant, `latency_ms`, `token_usage`, `ai_metadata`.

### Analytics events
- `chat_started` (khi mở session mới).
- `message_sent`.

### Possible failures
- AI timeout, response rỗng, token/API lỗi.

### Fallback behavior
- FE: hiện thông báo ngắn + nút retry.
- BE: trả fallback message ngắn, không làm crash session.

### Latency considerations
- Target phản hồi: ideal 1-2s, max <3s.
- Tách bước detect flashcard candidate khỏi critical path nếu cần.

### Mode switching logic
- Nếu user đổi tab sang roleplay, message tiếp theo dùng mode mới; không tạo session mới.

## 6. Roleplay Chat Workflow

### Trigger
- User chọn mode `roleplay` và gửi message, hoặc bắt đầu roleplay mới.

### Actors involved
- User, Frontend, Backend, AI model, MongoDB.

### Frontend actions
- Gửi `POST /chat/message` với `mode=roleplay`.
- Hiển thị hội thoại theo turn.

### Backend actions
- Nạp context user + mode + recent roleplay turns.
- Chọn Roleplay prompt template.
- Lưu messages và mode.

### AI actions
- Dẫn dắt hội thoại tự nhiên, tránh dead chat.
- Dùng vocab phù hợp level/target exam.
- Có thể kết thúc hội thoại tự nhiên khi scenario hoàn thành.

### Database updates
- `chat_sessions.current_mode/last_mode`.
- `chat_messages.mode='roleplay'`.

### Analytics events
- `mode_switched` (knowledge <-> roleplay).
- `message_sent`.

### Possible failures
- AI tạo turn lạc đề, quá dài hoặc dead-end.

### Fallback behavior
- BE có post-check độ dài/cấu trúc cơ bản; nếu vi phạm thì regenerate 1 lần.
- FE cho user nút “Tiếp tục tình huống” hoặc “Đổi mode”.

## 7. Explain More Workflow

### Trigger
- User bấm nút `Explain more` trên một assistant message.

### Actors involved
- User, Frontend, Backend, AI model, MongoDB.

### Frontend actions
- Gửi `POST /chat/explain-more` kèm `parent_message_id`.
- Render nội dung mở rộng inline dưới message gốc.

### Backend actions
- Lấy message gốc + context gần nhất.
- Dùng Explain More prompt.
- Lưu message mở rộng với `explain_more_parent`.

### AI actions
- Mở rộng step-by-step, có cấu trúc, vẫn concise.

### Database updates
- `chat_messages`: thêm message mới với `explain_more_parent=<id message gốc>`.

### Analytics events
- `explain_more_clicked`.

### Possible failures
- Parent message không tồn tại, AI timeout.

### Fallback behavior
- FE hiển thị “Không mở rộng được, thử lại”.
- BE trả `404` (parent missing) hoặc `503` (AI timeout).

## 8. Flashcard Generation Workflow

### Trigger
- User bấm `Tạo flashcard` hoặc hệ thống auto suggest sau chat.

### Actors involved
- User, Frontend, Backend flashcard service, AI model, MongoDB.

### Frontend actions
- Gửi `POST /flashcards/generate` (session/context hiện tại).
- Hiển thị số card tạo được hoặc thông báo không có card phù hợp.

### Backend actions
- Thu thập nguồn: recent_messages, weak_topics, mistakes.
- Gọi AI prompt tạo flashcard JSON.
- Validate schema + chống duplicate.
- Lưu card hợp lệ.

### AI actions
- Trích xuất từ/cấu trúc quan trọng, practical, đúng target exam.

### Database updates
- `flashcards`: insert nhiều bản ghi.
- Có thể tạo `duplicate_key` để chống trùng.

### Analytics events
- `flashcard_generated`.

### Possible failures
- AI trả JSON lỗi format, tạo trùng nhiều, không có dữ liệu đủ tốt.

### Fallback behavior
- BE chuẩn hóa/validate; item lỗi thì bỏ qua item đó.
- Nếu 0 item hợp lệ: trả kết quả rỗng có reason ngắn.

## 9. Flashcard Review Workflow

### Trigger
- User swipe flashcard: phải (đã biết) / trái (cần ôn).

### Actors involved
- User, Frontend swipe UI, Backend review API, MongoDB.

### Frontend actions
- Gửi `POST /flashcards/:id/swipe` với action.
- Cập nhật UI card tiếp theo ngay (optimistic).

### Backend actions
- Cập nhật `review_state`.
- Tính `next_review_at` theo rule MVP:
  - swipe trái: cuối buổi + hôm sau
  - swipe phải: giảm tần suất ôn
- Ghi lịch sử review.

### AI actions
- Không bắt buộc ở bước swipe.

### Database updates
- `flashcards`: update `review_state`, `next_review_at`, `last_reviewed_at`, `review_count`.
- `flashcard_reviews`: insert log review.

### Analytics events
- `flashcard_reviewed` (hoặc `flashcard_swiped_left/right` tùy implementation tracking).

### Possible failures
- Double submit do swipe nhanh.

### Fallback behavior
- BE dùng idempotency key ngắn hạn hoặc dedupe theo timestamp gần.
- FE rollback trạng thái nếu API fail.

Need clarification:
- Enum chuẩn cho `review_state`.

## 10. Quiz Generation Workflow

### Trigger
- User bấm tạo quiz hoặc hệ thống gợi ý daily quiz.

### Actors involved
- User, Frontend, Backend quiz service, AI model, MongoDB.

### Frontend actions
- Gửi `POST /quizzes/generate`.
- Hiển thị bộ câu hỏi sau khi tạo thành công.

### Backend actions
- Lấy context: weak_topics, chat history, flashcards gần đây.
- Chọn độ khó theo level + target exam.
- Gọi AI prompt quiz JSON.
- Validate schema, lưu quiz.

### AI actions
- Tạo câu hỏi theo 4 loại cho phép.
- Không trick question.
- Explanation ngắn.

### Database updates
- `quizzes`: insert quiz + questions.

### Analytics events
- `quiz_generated`.

### Possible failures
- JSON sai schema, câu hỏi trùng/lỗi.

### Fallback behavior
- Regenerate 1 lần khi schema fail.
- Nếu vẫn fail: trả lỗi ngắn + cho thử lại.

## 11. Quiz Attempt Workflow

### Trigger
- User submit đáp án quiz.

### Actors involved
- User, Frontend quiz UI, Backend grading service, MongoDB.

### Frontend actions
- Gửi `POST /quizzes/:id/submit` với answers.
- Hiển thị điểm, đúng/sai, giải thích ngắn.

### Backend actions
- Chấm điểm theo `correct_answer`.
- Tính `score`, `weak_topics`.
- Lưu attempt.
- Cập nhật progress snapshot.

### AI actions
- Không bắt buộc; explanation đã nằm trong quiz item.

### Database updates
- `quiz_attempts`: insert attempt.
- `user_progress`: update `quiz_accuracy`, `weak_topics`, `daily_activity`.

### Analytics events
- `quiz_completed` (hoặc `quiz_submitted`).

### Possible failures
- Payload answers thiếu, quiz không tồn tại.

### Fallback behavior
- BE trả lỗi validation rõ ràng.
- FE cho phép sửa đáp án và submit lại (nếu policy cho phép).

Need clarification:
- Policy làm lại quiz trong MVP (cho phép bao nhiêu lần).

## 12. Progress Tracking Workflow

### Trigger
- Sau các hành động: chat, review flashcard, submit quiz.

### Actors involved
- Backend progress updater, MongoDB, Frontend dashboard/progress page.

### Frontend actions
- Gọi `GET /progress/overview` khi vào dashboard/progress screen.

### Backend actions
- Tính/cập nhật counters:
  - learned_words_count
  - flashcards_completed
  - quiz_accuracy
  - weak_topics
  - streak_days
  - total_chat_sessions
  - daily_activity
- Áp dụng timezone của user cho date_key.

### AI actions
- Không bắt buộc.

### Database updates
- `user_progress` update theo incremental counters.

### Analytics events
- Có thể phát sinh từ các flow nguồn; progress không cần event riêng bắt buộc.

### Possible failures
- timezone thiếu/sai, race condition khi update liên tiếp.

### Fallback behavior
- Dùng atomic update (`$inc`, `$set`) để giảm race.
- fallback timezone về UTC nếu thiếu.

## 13. AI Personalization Workflow

### Trigger
- Mỗi lần gọi AI cho chat/flashcard/quiz.

### Actors involved
- Backend context builder, AI model, MongoDB.

### Frontend actions
- Không trực tiếp; FE chỉ gửi request nghiệp vụ.

### Backend actions
- Gom context:
  - onboarding (level/target)
  - recent chat
  - weak_topics
  - favorite_topics
- Inject vào prompt variables.

### AI actions
- Adapt vocabulary/grammar/độ khó theo context.
- Match example style theo target exam.

### Database updates
- Không bắt buộc mỗi lần; gián tiếp qua output (message/card/quiz).

### Analytics events
- Không bắt buộc event riêng; track qua kết quả các flow chính.

### Possible failures
- Context thiếu hoặc mâu thuẫn.

### Fallback behavior
- Ưu tiên `current_level + target_exam` làm baseline.
- Nếu thiếu weak_topics -> dùng recent_messages.

Assumption needed:
- Trọng số chính xác giữa `recency` và `weak_topics`.

## 14. Guest User Workflow

### Trigger
- Người dùng vào app và chọn dùng thử không đăng nhập.

### Actors involved
- Guest user, Frontend, Backend, MongoDB.

### Frontend actions
- Tạo/lưu `guest_token`.
- Cho phép chat trong giới hạn quota.

### Backend actions
- Tạo `guest_sessions`.
- Kiểm tra `message_limit` trước mỗi request chat.
- Lưu chat như session bình thường nhưng gắn `guest_session_id`.

### AI actions
- Hoạt động như user thường nhưng với context guest.

### Database updates
- `guest_sessions`: `message_used`, `expires_at`.
- `chat_sessions/chat_messages`: gắn `guest_session_id`.

### Analytics events
- `chat_started`, `message_sent` (gắn guest_session_id).

### Possible failures
- Guest hết quota hoặc session hết hạn.

### Fallback behavior
- FE hiển thị CTA đăng ký/đăng nhập.
- BE trả mã lỗi quota/expired rõ ràng.

Need clarification:
- Quota message chính xác (5 hay 10).

## 15. Guest -> Registered Merge Workflow

### Trigger
- Guest hoàn tất signup/login.

### Actors involved
- User, Frontend, Backend merge service, MongoDB.

### Frontend actions
- Sau auth success, gọi `POST /guest/merge`.
- Refresh dashboard/chat history.

### Backend actions
- Xác thực guest_session và user mới.
- Re-assign dữ liệu guest sang `user_id`.
- Đánh dấu `merge_on_signup.merged=true`.

### AI actions
- Không bắt buộc.

### Database updates
- `guest_sessions`: update merged status.
- `chat_sessions/chat_messages`: update owner sang user.
- `users.guest_conversion`: cập nhật metadata chuyển đổi.

### Analytics events
- `guest_signup_conversion`, `signup_completed`.

### Possible failures
- Merge trùng lặp, guest session hết hạn.

### Fallback behavior
- Merge theo transaction logic hoặc cơ chế idempotent.
- Nếu hết hạn: tạo account bình thường, báo “không thể khôi phục dữ liệu guest”.

## 16. Dashboard Data Flow

### Trigger
- User vào Home Dashboard.

### Actors involved
- Frontend dashboard, Backend aggregate endpoints, MongoDB.

### Frontend actions
- Gọi song song:
  - recent chats
  - flashcards hôm nay
  - quiz hôm nay
  - progress overview

### Backend actions
- Trả dữ liệu tổng hợp tối giản cho load nhanh.
- Ưu tiên đọc từ `user_progress` snapshot và index sẵn có.

### AI actions
- Không bắt buộc ở bước load dashboard.

### Database updates
- Không bắt buộc.

### Analytics events
- Có thể track `dashboard_viewed` (Assumption needed nếu muốn thêm).

### Possible failures
- Một widget lỗi làm chậm toàn trang.

### Fallback behavior
- FE render từng widget độc lập; widget lỗi hiển thị retry cục bộ.

Assumption needed:
- Event `dashboard_viewed` chưa nằm trong danh sách bắt buộc hiện tại.

## 17. Analytics Event Workflow

### Trigger
- Trigger theo từng action nghiệp vụ.

### Actors involved
- Frontend tracker, Backend tracker, analytics store (`analytics_events` / PostHog).

### Frontend actions
- Bắn event UI-level (ví dụ click explain_more, mode switch).

### Backend actions
- Bắn event server-side cho action quan trọng (generate/submit).
- Ghi vào `analytics_events` (nếu self-store) và/hoặc đẩy PostHog.

### AI actions
- Không trực tiếp.

### Database updates
- `analytics_events` insert event.

### Analytics events chính
- `onboarding_complete`
- `chat_started`
- `message_sent`
- `explain_more_clicked`
- `mode_switched`
- `flashcard_generated`
- `flashcard_reviewed`
- `quiz_generated`
- `quiz_completed`
- `guest_signup_conversion`

### Payload cơ bản gợi ý
- `event_name`, `user_id|guest_session_id`, `session_id`, `target_exam`, `user_level`, `event_at`, `properties`.

### Possible failures
- Mất event do network/adblock, duplicate event.

### Fallback behavior
- Queue retry ngắn hạn phía FE/BE.
- Dedupe theo `event_id` ở backend nếu có.

## 18. Error Handling Workflows

### 18.1 AI timeout (chat/explain_more)
- FE behavior: hiển thị lỗi ngắn + nút thử lại.
- BE behavior: timeout guard, trả lỗi chuẩn.
- Retry strategy: retry 1 lần tự động hoặc manual retry.
- User-facing response: “Phản hồi đang chậm, bạn thử lại nhé.”

### 18.2 Empty flashcard generation
- FE behavior: hiển thị “Chưa có card phù hợp”.
- BE behavior: trả mảng rỗng + reason.
- Retry strategy: gợi ý chat thêm nội dung rồi generate lại.
- User-facing response: ngắn gọn, không lỗi kỹ thuật dài.

### 18.3 Failed quiz generation
- FE behavior: hiển thị fail state + nút tạo lại.
- BE behavior: validate schema, regenerate 1 lần trước khi fail cứng.
- Retry strategy: manual retry.
- User-facing response: “Chưa tạo được quiz, thử lại sau vài giây.”

### 18.4 Invalid onboarding data
- FE behavior: highlight field lỗi.
- BE behavior: trả validation details.
- Retry strategy: user chỉnh và submit lại.
- User-facing response: nêu rõ field nào sai.

### 18.5 Expired guest session
- FE behavior: hiện CTA signup/login.
- BE behavior: trả mã session expired.
- Retry strategy: tạo guest session mới hoặc đăng ký.
- User-facing response: thông báo dữ liệu dùng thử đã hết hạn.

### 18.6 API failure chung
- FE behavior: global toast lỗi ngắn + retry.
- BE behavior: standardized error format.
- Retry strategy: exponential backoff nhẹ cho request non-critical.
- User-facing response: không lộ stack trace.

### 18.7 Duplicate generation (flashcard/quiz)
- FE behavior: không hiển thị bản ghi trùng.
- BE behavior: dedupe bằng `duplicate_key` / hash nội dung.
- Retry strategy: regenerate phần item trùng.
- User-facing response: không cần báo chi tiết kỹ thuật.

## 19. Admin Moderation Workflow

### Trigger
- Admin mở trang reports hoặc thực hiện action block/dismiss.

### Actors involved
- Admin, Frontend admin panel, Backend admin API, MongoDB.

### Frontend actions
- Gọi `GET /admin/reports`, `GET /admin/users`.
- Gửi `POST /admin/reports/:id/action`.

### Backend actions
- Trả danh sách report theo status.
- Lưu action moderation.
- Áp dụng block content ở nguồn dữ liệu liên quan.

### AI actions
- Không bắt buộc trong MVP moderation.

### Database updates
- `reports.status`, `reports.admin_flags`.
- Có thể cập nhật cờ ẩn ở document nguồn (chat/flashcard/quiz).

### Analytics events
- Assumption needed: có thể track `admin_report_resolved`, chưa bắt buộc trong MVP list.

### Possible failures
- Report source không tồn tại, admin action conflict.

### Fallback behavior
- BE trả trạng thái hiện tại mới nhất.
- FE refresh danh sách sau action để đồng bộ.

Need clarification:
- Cơ chế cấp quyền admin (role trong `users` hay account admin riêng).

## 20. Future Workflow Expansion Notes

- Mobile app (React Native):
  - Tái sử dụng API/workflow hiện có; thêm token refresh và offline queue nếu cần.
- AI memory nâng cao:
  - Thêm workflow summarize theo session để cá nhân hóa sâu hơn.
- Recommendation engine:
  - Dựa trên `analytics_events + user_progress` để gợi ý bài học.
- Multi-language UI:
  - Mở rộng workflow settings cho đổi ngôn ngữ.
- Vector search:
  - Thêm retrieval workflow cho ví dụ/chủ đề liên quan.

Các phần trên **không nằm trong MVP hiện tại**.
