# Project Implementation Plan

## 1. Planning Philosophy

- MVP-first: ưu tiên sản phẩm chạy được end-to-end hơn kiến trúc “đẹp hoàn hảo”.
- Ship nhanh theo vòng lặp ngắn: build -> test -> đo analytics -> chỉnh.
- Giảm complexity: 1 backend service (Express), 1 frontend app (Next.js), MongoDB Atlas.
- Giữ code clean-enough để mở rộng sau, không làm premature scaling.

## 2. MVP Development Strategy

- Chiến lược tổng thể:
1. Dựng nền tảng kỹ thuật và auth/onboarding.
2. Build chat core + AI integration + lưu lịch sử.
3. Build flashcard generation + review loop.
4. Build quiz generation + attempt + progress.
5. Build dashboard + analytics + admin basic + deploy.

- Nguyên tắc giao hàng:
1. Mỗi phase đều có demo chạy được.
2. Không mở rộng feature ngoài `MVP_SCOPE.md`.
3. Feature chưa ổn định thì khóa scope, không thêm nhánh mới.

## 3. Architecture Overview

- Frontend: Next.js (App Router), React, mobile-first responsive.
- Backend: Node.js + Express REST API.
- Database: MongoDB Atlas + Mongoose.
- AI: OpenAI-compatible APIs, prompt lấy từ `SYSTEM_PROMPTS.md`.
- Analytics: PostHog (chính), có thể thêm GA cho web traffic.
- Deploy:
1. Frontend -> Vercel.
2. Backend -> Railway/Render/VPS.
3. DB -> MongoDB Atlas.

## 4. Development Order

### Phase 1: Foundation
- Mục tiêu: Có skeleton chạy được, auth + onboarding + DB kết nối ổn.
- Dependency: không.
- Deliverables:
1. Monorepo hoặc 2 repo FE/BE rõ ràng.
2. Mongoose models cốt lõi (`users`, `guest_sessions`).
3. Auth APIs (`signup/login/google/logout`).
4. Onboarding API + UI 4 bước.
- Risks:
1. OAuth config.
2. Validation target score chưa chuẩn.

### Phase 2: Chat MVP
- Mục tiêu: Chat Knowledge/Roleplay hoạt động, lưu lịch sử, switch mode realtime.
- Dependency: Phase 1.
- Deliverables:
1. `chat_sessions`, `chat_messages` model + index.
2. API chat (`/chat/message`, `/chat/sessions`).
3. Prompt routing Knowledge/Roleplay.
4. UI chat + mode tab + loading/retry.
- Risks:
1. AI latency >3s.
2. Context/prompt mapping sai target exam.

### Phase 3: Flashcard Loop
- Mục tiêu: Tạo flashcard từ chat và review bằng swipe.
- Dependency: Phase 2.
- Deliverables:
1. `flashcards`, `flashcard_reviews` model.
2. API generate + swipe + danh sách hôm nay.
3. Duplicate prevention bằng `duplicate_key`.
4. UI swipe và lịch ôn cơ bản.
- Risks:
1. Duplicate card.
2. Empty generation.

### Phase 4: Quiz + Progress
- Mục tiêu: Tạo quiz, chấm điểm, cập nhật tiến độ.
- Dependency: Phase 3.
- Deliverables:
1. `quizzes`, `quiz_attempts`, `user_progress`.
2. API generate quiz + submit attempt + progress overview.
3. Logic weak topics từ attempt.
4. UI quiz flow + result.
- Risks:
1. Độ khó quiz không ổn định.
2. Cập nhật progress race condition.

### Phase 5: Dashboard + Guest + Admin + Analytics + Deploy
- Mục tiêu: Hoàn thiện loop sử dụng thực tế và phát hành.
- Dependency: Phase 4.
- Deliverables:
1. Dashboard tổng hợp dữ liệu.
2. Guest flow + merge sau signup.
3. Admin basic (users/reports/block).
4. Analytics events cốt lõi.
5. Production deploy + smoke test.
- Risks:
1. Guest merge lỗi/mất dữ liệu.
2. Analytics thiếu event.

## 5. Sprint Breakdown

### Sprint 1 (Foundation)
- Objectives:
1. Setup FE/BE/DB.
2. Auth + onboarding.
- Tasks:
1. Project structure, env, logging, error format.
2. `users` schema + auth middleware.
3. Onboarding API + form UI.
- Estimated complexity: Trung bình.
- Blockers:
1. OAuth credentials.
2. Môi trường deploy tạm.
- Priority: P0.

### Sprint 2 (Chat MVP)
- Objectives:
1. Knowledge/Roleplay chat end-to-end.
2. Lưu lịch sử chat.
- Tasks:
1. `chat_sessions`, `chat_messages`.
2. Chat API + prompt injection + response parser.
3. Chat UI, mode switch, retry.
- Estimated complexity: Cao.
- Blockers:
1. AI latency.
2. Prompt quality.
- Priority: P0.

### Sprint 3 (Flashcard)
- Objectives:
1. Tạo flashcard từ chat.
2. Swipe review hoạt động.
- Tasks:
1. Flashcard extraction pipeline.
2. Swipe API + schedule next review.
3. Flashcard UI.
- Estimated complexity: Trung bình.
- Blockers:
1. JSON output từ AI không ổn định.
- Priority: P0.

### Sprint 4 (Quiz + Progress)
- Objectives:
1. Quiz generation + attempt + scoring.
2. Progress tracking.
- Tasks:
1. Quiz schema + attempt schema.
2. Submit grading + weak topics.
3. Progress API + UI.
- Estimated complexity: Cao.
- Blockers:
1. Quiz quality consistency.
- Priority: P0.

### Sprint 5 (Dashboard + Guest + Admin + Release)
- Objectives:
1. Dashboard hoàn chỉnh.
2. Guest flow + merge.
3. Admin basic + analytics + deploy.
- Tasks:
1. Dashboard aggregate API + UI widgets.
2. Guest limit + expiry + merge API.
3. Admin reports/users/block.
4. Event tracking + release checklist.
- Estimated complexity: Cao.
- Blockers:
1. Merge data integrity.
2. Thiếu event tracking.
- Priority: P0/P1.

## 6. Backend Implementation Plan

- Express structure:
1. `src/modules/auth`
2. `src/modules/onboarding`
3. `src/modules/chat`
4. `src/modules/flashcards`
5. `src/modules/quizzes`
6. `src/modules/progress`
7. `src/modules/guest`
8. `src/modules/admin`
9. `src/modules/analytics`

- Route order:
1. Health + auth.
2. Onboarding/profile.
3. Chat/explain_more.
4. Flashcard.
5. Quiz/attempt.
6. Progress.
7. Guest merge.
8. Admin.

- Middleware strategy:
1. `requestId`, `logger`, `errorHandler`.
2. `authRequired` cho user APIs.
3. `guestOrAuth` cho chat trial.
4. `rateLimit` cho chat/generate endpoints.
5. `validateBody` theo schema.

- AI orchestration flow:
1. Build runtime context.
2. Load system prompt theo mode/task.
3. Call AI API.
4. Validate output.
5. Persist DB.
6. Emit analytics.

- Mongo integration:
1. Mongoose models theo `DB_SCHEMA.md`.
2. Index tạo ngay khi migration khởi tạo.

- Guest handling:
1. Kiểm tra quota trước chat.
2. TTL cleanup tự động qua index `expires_at`.

## 7. Frontend Implementation Plan

- Next.js structure:
1. `app/(auth)` login/signup.
2. `app/onboarding`.
3. `app/dashboard`.
4. `app/chat`.
5. `app/flashcards`.
6. `app/quizzes`.
7. `app/progress`.
8. `app/admin`.

- State management:
1. Server state: React Query/SWR.
2. UI state: local state + context nhẹ cho auth/session.

- Chat UI flow:
1. Nhập message -> optimistic append user bubble.
2. Hiện typing/loading.
3. Render assistant response + Explain more inline.
4. Hỗ trợ switch mode realtime.

- Flashcard swipe:
1. Swipe gesture -> optimistic update.
2. API fail -> rollback card state.

- Dashboard rendering:
1. Load từng widget độc lập.
2. Widget lỗi không chặn toàn màn hình.

- UX priorities:
1. Mobile-first.
2. Loading state rõ.
3. Retry dễ dùng.

## 8. AI Integration Plan

- Prompt loading strategy:
1. Lưu prompt templates server-side (theo `SYSTEM_PROMPTS.md`).
2. Version hóa prompt (`prompt_version`) trong `ai_metadata`.

- Runtime variables:
1. `user_level`, `target_exam`, `target_score`
2. `chat_mode`, `recent_messages`, `weak_topics`
3. `user_topics`, `user_language`, `session_context`

- Response formatting:
1. Chat: text ngắn, có cấu trúc.
2. Flashcard/Quiz: bắt buộc JSON schema.

- Token optimization:
1. Chỉ gửi context gần.
2. Truncate lịch sử theo số message/token.
3. Không lặp instruction dư thừa.

- Explain more flow:
1. Nhận `parent_message_id`.
2. Prompt expansion chuyên biệt.
3. Lưu `explain_more_parent`.

- Flashcard extraction flow:
1. Từ recent messages + mistakes.
2. Dedupe bằng `duplicate_key`.

- Quiz generation flow:
1. Dựa trên weak topics + recent learning.
2. Validate type chỉ trong 4 loại allowed.

- Không triển khai:
1. Multi-agent orchestration.
2. Autonomous agent system.

## 9. Database Implementation Plan

- Collection creation order:
1. `users`, `guest_sessions`
2. `chat_sessions`, `chat_messages`
3. `flashcards`, `flashcard_reviews`
4. `quizzes`, `quiz_attempts`
5. `user_progress`
6. `analytics_events`, `reports`

- Indexes:
1. Tạo theo `DB_SCHEMA.md` ngay sau model init.

- Seed strategy:
1. Seed minimal admin user (nếu cần).
2. Seed sample onboarding options (nếu lưu DB).

- Migration approach:
1. MVP dùng migration script đơn giản theo phiên bản.
2. Tránh framework migration nặng.

- Cleanup jobs:
1. Guest TTL bằng Mongo TTL index.
2. Analytics retention bằng cron job nhẹ (nếu bật).

Need clarification:
- Thời gian retention analytics chính thức.

## 10. Auth & Session Plan

- Auth methods:
1. Email/password.
2. Google OAuth.

- Session/token:
1. Access token cho API calls.
2. Guest token riêng cho guest flow.

- Session rules:
1. User logout -> revoke token phía client.
2. Guest session hết hạn theo `expires_at`.

- Merge rules:
1. Signup xong gọi merge guest.
2. Idempotent merge để tránh duplicate.

## 11. Analytics Plan

- Event bắt buộc:
1. `onboarding_complete`
2. `chat_started`
3. `message_sent`
4. `explain_more_clicked`
5. `mode_switched`
6. `flashcard_generated`
7. `flashcard_reviewed`
8. `quiz_generated`
9. `quiz_completed`
10. `guest_signup_conversion`

- Tracking strategy:
1. FE track UI actions.
2. BE track business-critical completions.
3. Event payload có `user_id|guest_session_id`, `session_id`, `event_at`.

- Validation:
1. Daily check event volume.
2. Check missing critical events theo funnel.

## 12. Deployment Plan

- Environments:
1. `dev`
2. `staging` (optional, nếu thời gian cho phép)
3. `production`

- Deploy direction:
1. FE -> Vercel.
2. BE -> Railway/Render/VPS (ưu tiên Railway/Render để ship nhanh).
3. DB -> MongoDB Atlas.

- CI/CD tối thiểu:
1. Lint + build check trước merge.
2. Auto deploy main branch.

- Env keys:
1. Mongo URI
2. JWT secret
3. Google OAuth keys
4. AI API key
5. PostHog key

## 13. Testing Plan

- Smoke testing:
1. Auth login/signup.
2. Onboarding submit.
3. Chat gửi/nhận.
4. Flashcard generate/swipe.
5. Quiz generate/submit.
6. Dashboard load.

- Chat flow testing:
1. Knowledge concise-first.
2. Roleplay switch mode realtime.
3. Explain more inline.

- AI response validation:
1. Knowledge response <80 từ ở đa số case.
2. Ví dụ đúng target exam.
3. Không essay dài.

- Flashcard validation:
1. Schema đúng.
2. Tỷ lệ duplicate thấp.

- Quiz validation:
1. Đúng 4 loại câu hỏi cho phép.
2. Scoring chính xác.
3. Explanation ngắn.

- Onboarding testing:
1. Validate field bắt buộc.
2. Persist đúng profile.

- Guest flow testing:
1. Quota limit.
2. Expiry.
3. Merge sau signup.

## 14. Risk Areas

1. AI latency cao làm UX chat chậm.
2. Hallucination hoặc response lệch target exam.
3. Duplicate flashcards.
4. Độ khó quiz không nhất quán.
5. Guest merge lỗi hoặc mất dữ liệu.
6. Token cost tăng nhanh do context dài.
7. Chat context overflow.

## 15. Scope Cut Strategy

- Cắt theo thứ tự nếu thiếu thời gian:
1. Leaderboard.
2. Advanced analytics.
3. Streak nâng cao.
4. Advanced roleplay branching.
5. Admin analytics.
6. Email reminders.

- Không được cắt:
1. Chatbot (Knowledge + Roleplay).
2. Flashcard.
3. Quiz.
4. Onboarding.
5. Progress tracking cơ bản.

## 16. Recommended Build Timeline

- Tuần 1: Foundation (Sprint 1).
- Tuần 2: Chat MVP (Sprint 2).
- Tuần 3: Flashcard (Sprint 3).
- Tuần 4: Quiz + Progress (Sprint 4).
- Tuần 5: Dashboard + Guest + Admin + Analytics + Deploy (Sprint 5).

Assumption needed:
- Team nhỏ 2-4 người hoặc Codex-driven build song song FE/BE.

## 17. Definition of Done

- Feature hoàn thành khi:
1. API chạy ổn định với dữ liệu thật.
2. UI flow hoàn chỉnh end-to-end.
3. Dữ liệu DB lưu đúng schema/index chính.
4. Event analytics cốt lõi được bắn đúng.
5. Có smoke test pass cho flow đó.

- AI response acceptable criteria:
1. Knowledge mode concise-first, đa số response <80 từ.
2. Có ví dụ phù hợp khi cần.
3. Grammar có công thức/cấu trúc.
4. Ví dụ đúng target exam/level.

- Latency acceptable criteria:
1. Chat phản hồi thông thường <3 giây.
2. Ideal 1-2 giây cho phần lớn request.

- UI responsiveness criteria:
1. Không vỡ layout mobile ở màn hình chính.
2. Loading/retry states rõ ràng.
3. Không block toàn trang khi 1 widget dashboard lỗi.

Need clarification:
- Quy tắc chính thức cho retry quiz attempt.
- Quota guest chính xác (5 hay 10).
- Chính sách xóa account (soft/hard delete).
