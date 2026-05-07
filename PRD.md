# PRD MVP v1.0 — App/Web học tiếng Anh bằng AI (Vibecoding Style)

## 1. Tổng quan sản phẩm

- Sản phẩm: web app học tiếng Anh bằng AI cho nhóm 16–25 tuổi, attention span ngắn, cần học nhanh và thực dụng.
- Định vị: "Hỏi gì đáp nấy", học được thứ hữu ích trong dưới 30 giây.
- Nền tảng MVP: Web responsive (MERN), chưa làm PWA/offline.

## 2. Mục tiêu MVP

- Validate retention và hành vi học thực tế trước monetization.
- Tạo thói quen học mỗi ngày trong 2 tuần đầu.
- Tăng phản xạ tiếng Anh cơ bản, vocab thực tế, grammar phổ biến.
- Giảm rào cản tâm lý khi hỏi/tra cứu tiếng Anh.

## 3. Non-goals MVP

- Không tập trung học thuật sâu từ đầu.
- Không làm gamification phức tạp, leaderboard, advanced branching roleplay.
- Không làm voice chat, pronunciation scoring, export data.

## 4. Đối tượng người dùng

- Học sinh cấp 3, sinh viên, người mới học/mất gốc/basic.
- Có thể mở rộng IELTS/TOEIC beginner sau.

## 5. Phạm vi tính năng

### Must-have

- Chatbot 2 mode: Knowledge, Roleplay.
- AI tạo flashcard.
- AI tạo quiz.
- Lưu lịch sử chat.
- Lưu tiến độ học.
- Đăng nhập cơ bản (Google + email/password).
- Guest mode (chat thử giới hạn message, lưu tạm 7 ngày, merge khi signup).
- Dashboard học tập.
- Admin page cơ bản.

### Nice-to-have (nếu còn thời gian)

- Streak nâng cao, leaderboard, gamification sâu, email reminder.

## 6. UX Flow chính

### Onboarding

1. Chọn level: Mất gốc/Beginner/Intermediate/Advanced.
2. Chọn mục tiêu: Giao tiếp/TOEIC/IELTS/VSTEP/Công việc/Du lịch.
3. Chọn target cụ thể (ví dụ IELTS 6.5, TOEIC 700, VSTEP B1).
4. Chọn chủ đề yêu thích.

### Sau login vào Home Dashboard

- Continue Chat (CTA lớn nhất).
- Flashcard hôm nay.
- Quiz hôm nay.
- Progress tracking.
- Recent topics.

### Chat

- Default mode: Knowledge.
- Switch mode realtime bằng segmented tab ở đầu màn chat.
- Có nút "Explain more", mở rộng ngay dưới response cũ, không tạo message mới.

## 7. Đặc tả hành vi AI

### Quy tắc cứng

- Ưu tiên dưới 80 từ/response.
- Ngắn gọn, practical, readability cao.
- Không essay, không textbook dài.
- Grammar nên có cấu trúc/công thức.
- Cố gắng luôn có ví dụ.

### Khi nào được trả lời dài hơn

- User yêu cầu rõ.
- User bấm "Explain more".
- Câu hỏi grammar phức tạp hoặc user yêu cầu breakdown.

### Mode Knowledge (ưu tiên số 1)

- Format ưu tiên: Giải thích ngắn -> Công thức/cấu trúc -> Ví dụ.
- Cho phép compact nếu câu hỏi rất đơn giản.

### Mode Roleplay

- AI vừa chủ động dẫn hội thoại vừa phản hồi user.
- Tránh dead chat, giữ flow tự nhiên theo tình huống.
- Vocabulary và độ khó bám theo level + target exam.

### Boundary nội dung

- Nếu ngoài phạm vi học tiếng Anh: trả lời ngắn + redirect nhẹ về tiếng Anh, không hard reject.

### Mapping độ khó theo target

- TOEIC beginner: A1–B1, workplace/basic communication, câu ngắn.
- IELTS 6.5: từ vựng học thuật hơn, cấu trúc câu dài hơn.
- VSTEP B1/B2: cân bằng grammar và giao tiếp theo dạng task gần đề.

## 8. Flashcard logic

### Trigger

- Auto suggest sau chat.
- Manual "Tạo flashcard".

### Swipe

- Quẹt phải: đã biết.
- Quẹt trái: cần ôn.

### Scheduling MVP

- Card quẹt trái xuất hiện lại cuối buổi và hôm sau.
- Chưa áp dụng spaced repetition phức tạp.

## 9. Quiz logic

### Trigger

- Manual generate.
- Daily recommended quiz.
- AI suggest sau khi user học đủ nội dung liên quan.

### Loại câu hỏi

- Multiple choice, fill in the blank, grammar correction, vocabulary.

### Kết quả

- Hiển thị điểm, đúng/sai, giải thích ngắn.

## 10. Data model MVP (MongoDB)

### users

- profile cơ bản, auth providers, onboarding selections, timezone.

### chat_sessions

- user_id/guest_id, title, last_mode, timestamps.

### chat_messages

- session_id, role, content, mode, explain_more_parent_id (nếu có), metadata target/level.

### flashcards

- term, meaning_vi, pronunciation, example, target_exam, level_tag, source_message_id, difficulty, review_state, created_at.
- optional: synonym, grammar_note, ipa.

### quiz_sets và quiz_items

- type, question, options, correct_answer, explanation, source, target_exam, skill_tag, difficulty, created_at.

### progress_daily

- words_learned, flashcards_done, quiz_done, quiz_accuracy, grammar_weak_points, chat_activity, streak.

### reports

- reported content, reason, status, moderator action.

### guest_sessions

- temporary data, expiry 7 ngày, merge_state.

## 11. API boundary (Express)

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/logout`

### Onboarding/Profile

- `POST /onboarding`
- `GET /me`
- `PATCH /me`

### Chat

- `POST /chat/message`
- `POST /chat/explain-more`
- `GET /chat/sessions`
- `GET /chat/sessions/:id`

### Flashcard

- `POST /flashcards/generate`
- `GET /flashcards/today`
- `POST /flashcards/:id/swipe`

### Quiz

- `POST /quizzes/generate`
- `GET /quizzes/today`
- `POST /quizzes/:id/submit`

### Progress

- `GET /progress/overview`
- `GET /progress/weak-points`

### Guest

- `POST /guest/session`
- `POST /guest/merge`

### Account

- `DELETE /account`

### Admin

- `GET /admin/users`
- `GET /admin/reports`
- `POST /admin/reports/:id/action`

## 12. Analytics đo lường

### Stack

- PostHog (chính), GA (traffic web).

### KPI

- DAU, số phiên chat/ngày, average session duration, D7 retention, số flashcard hoàn thành, số quiz làm/ngày, guest->signup conversion.

### Event chính

- onboarding_started/completed
- chat_started
- message_sent
- explain_more_clicked
- mode_switched
- flashcard_generated
- flashcard_swiped_left/right
- quiz_generated
- quiz_submitted
- signup_completed

## 13. NFR

### Priority

1. Latency
2. Reliability
3. Cost
4. Security

### Mục tiêu hiệu năng

- Chat response target <3s, lý tưởng 1–2s.

### Timezone

- Daily reset theo local timezone user.

### Bảo mật MVP

- auth chuẩn, rate limit cơ bản, filter toxic/NSFW/spam/out-of-scope cơ bản.

## 14. Hạ tầng triển khai

- Frontend: Next.js/React deploy Vercel.
- Backend: Node/Express deploy Render/Railway/VPS.
- DB: MongoDB Atlas.
- Kiến trúc: FE/BE tách riêng, i18n-ready, mobile-migration-friendly (Expo/RN sau).

## 15. Scope cut khi thiếu thời gian

### Cắt trước

- leaderboard
- streak nâng cao
- advanced analytics
- advanced roleplay branching
- email reminder
- PWA/offline
- gamification sâu

### Không cắt

- chatbot
- flashcard generation
- quiz generation
- onboarding personalization
- progress tracking cơ bản

## 16. Acceptance criteria MVP

- User mới hoàn thành onboarding và bắt đầu chat trong cùng phiên.
- Chat Knowledge trả lời concise, đa số case <80 từ, có ví dụ/cấu trúc khi phù hợp.
- "Explain more" mở rộng inline đúng response.
- Flashcard tạo được từ chat, swipe hoạt động theo logic review.
- Quiz tạo được từ học liệu user và chấm điểm có giải thích ngắn.
- Dashboard hiển thị progress cơ bản đúng dữ liệu.
- Guest chat thử được và merge dữ liệu khi signup.
- Admin xem user/report và block content cơ bản.
