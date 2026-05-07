# MVP Scope

## 1. MVP Goal

- Xây một web app học tiếng Anh bằng AI usable thật, ship nhanh, đo được retention.
- Validate learning loop cốt lõi: Chat -> Flashcard -> Quiz -> Progress.
- Đảm bảo user học được nội dung hữu ích trong dưới 30 giây.

## 2. Product Philosophy

- Concise-first: trả lời ngắn, đúng trọng tâm.
- Practical-first: ưu tiên ứng dụng thực tế hơn đầy đủ học thuật.
- Fast-learning: thao tác ít, phản hồi nhanh, dễ tiếp tục học.
- Lightweight & Gen Z friendly: đơn giản, rõ CTA, không rườm rà.
- Không over-engineering ở MVP.

## 3. Core User Flow

1. User vào app (guest hoặc đăng nhập).
2. Nếu là user mới: hoàn tất onboarding 4 bước.
3. Vào Home Dashboard, CTA chính là Continue Chat.
4. Chat ở Knowledge mode (mặc định), có thể switch Roleplay realtime.
5. Tạo flashcard từ chat (auto suggest hoặc manual).
6. Làm quiz (daily recommended hoặc manual).
7. Theo dõi progress cơ bản trên dashboard.
8. Guest hết quota -> signup/login -> merge dữ liệu guest.

## 4. In-Scope Features

- Authentication: Google + email/password.
- Onboarding personalization 4 bước.
- Chatbot 2 mode: Knowledge + Roleplay.
- Explain More inline.
- Chat history.
- AI flashcard generation + swipe review.
- AI quiz generation + scoring + explanation ngắn.
- Progress tracking cơ bản.
- Home Dashboard cơ bản.
- Guest mode + merge dữ liệu.
- Admin panel cơ bản (users/reports/block đơn giản).
- Analytics tracking cốt lõi.

## 5. Out-of-Scope Features

- Native mobile app.
- PWA/offline mode.
- Multiplayer/social learning/classroom mode.
- Payment system phức tạp.
- Voice AI, pronunciation scoring, AI speaking scoring.
- Advanced moderation, enterprise admin system.
- Microservices, Kubernetes, distributed architecture phức tạp.
- Long-term memory AI phức tạp, agentic AI, multi-agent orchestration.

## 6. Must-Have Features (P0)

- Authentication.
- Onboarding.
- Knowledge Chat.
- Roleplay Chat.
- AI Flashcard Generation.
- AI Quiz Generation.
- Progress Tracking cơ bản.
- Chat History.
- Dashboard cơ bản.
- Guest Mode.
- Basic Admin Panel.
- Core analytics events (funnel chính).

## 7. Should-Have Features (P1)

- Explain-more optimization (UI/state/latency tuning).
- Smarter personalization (tinh chỉnh theo weak points rõ hơn).
- Quiz recommendation refinement.
- Analytics dashboard nội bộ cho product/admin.
- Streak cơ bản (nếu đủ thời gian).

## 8. Nice-to-Have Features (P2)

- Leaderboard.
- Gamification nâng cao.
- Advanced roleplay branching.
- Voice AI.
- Pronunciation scoring.
- Social learning.
- AI level scoring tổng hợp.

## 9. Deferred Features

- Mobile app (Expo/React Native).
- Multi-language UI switching (giữ i18n-ready, chưa build full).
- Email reminders.
- Advanced analytics ngoài KPI chính.
- Advanced admin moderation workflow.

## 10. AI Feature Scope

### In scope
- Concise-first responses (ưu tiên <80 từ).
- Practical examples.
- Adapt theo level + target exam (TOEIC/IELTS/VSTEP).
- Knowledge mode: giải thích ngắn + cấu trúc + ví dụ (linh hoạt compact).
- Roleplay mode: dẫn dắt + phản hồi, tránh dead chat.
- Flashcard generation từ chat context/lỗi sai.
- Quiz generation từ history/flashcard/weak points.

### Out of scope
- Long-term autonomous planning.
- Agentic workflow phức tạp.
- Multi-agent orchestration.

## 11. Technical Scope

- Stack: MERN (React/Next.js, Node.js/Express, MongoDB).
- API style: REST.
- DB: MongoDB Atlas.
- Deploy:
- Frontend: Vercel.
- Backend: Node service riêng (Render/Railway/VPS).
- FE/BE tách rõ, dễ migrate mobile sau.
- Không triển khai microservices/Kubernetes/event-driven phức tạp trong MVP.

## 12. UX Scope

- Web responsive, mobile-first.
- Default chat mode = Knowledge.
- Segmented tab để switch mode realtime.
- Explain More mở rộng inline dưới câu trả lời cũ.
- Dashboard có 5 khối chính: Continue Chat, Flashcard hôm nay, Quiz hôm nay, Progress, Recent topics.
- CTA chính luôn ưu tiên “Continue Chat”.

## 13. Analytics Scope

- Stack: PostHog (chính), GA (traffic web).
- KPI bắt buộc:
- DAU
- Chat sessions/day
- Average session duration
- D7 retention
- Flashcards completed/day
- Quizzes completed/day
- Guest -> Signup conversion
- Events bắt buộc:
- onboarding_started/completed
- chat_started, message_sent
- mode_switched, explain_more_clicked
- flashcard_generated, flashcard_swiped_left/right
- quiz_generated, quiz_submitted
- signup_completed

## 14. Admin Scope

- In scope:
- Xem danh sách users cơ bản.
- Xem danh sách reports.
- Block content đơn giản.
- Theo dõi trạng thái xử lý report.
- Out of scope:
- RBAC phức tạp.
- Moderation automation nâng cao.
- Enterprise audit/permission system.

## 15. Performance Targets

- Chat latency:
- Ideal: 1–2 giây.
- Max acceptable: <3 giây.
- UX:
- Response/loading state rõ ràng.
- Có retry khi timeout/lỗi.
- Web responsive ổn trên mobile + desktop.

## 16. Scope Cut Priority

Nếu thiếu thời gian, cắt theo thứ tự:
1. Leaderboard
2. Streak nâng cao
3. Advanced analytics
4. Advanced roleplay branching
5. Email reminders
6. Gamification sâu
7. Admin analytics

Không được cắt:
- Chatbot (Knowledge + Roleplay)
- Flashcard generation
- Quiz generation
- Onboarding personalization
- Progress tracking cơ bản

## 17. MVP Release Checklist

- [ ] Auth chạy ổn: Google + email/password.
- [ ] Onboarding 4 bước lưu đúng profile.
- [ ] Dashboard vào sau login, Continue Chat là CTA chính.
- [ ] Knowledge mode trả lời concise-first, practical, có ví dụ phù hợp.
- [ ] Roleplay mode hoạt động và switch mode realtime.
- [ ] Explain More mở rộng inline đúng response.
- [ ] Chat history lưu và load ổn.
- [ ] Flashcard generate từ chat + swipe update review state đúng logic.
- [ ] Quiz generate từ history/weak points + chấm điểm + giải thích ngắn.
- [ ] Progress hiển thị đủ metrics cơ bản, reset theo local timezone.
- [ ] Guest mode có quota, hết quota có CTA signup/login.
- [ ] Merge guest data sau signup hoạt động, không duplicate.
- [ ] Admin xem users/reports và block content cơ bản.
- [ ] Event analytics cốt lõi gửi đầy đủ.
- [ ] Chat latency đạt mục tiêu vận hành (<3s).
- [ ] Safety filter cơ bản hoạt động (toxic/NSFW/spam/out-of-scope).

## Need clarification

- Giới hạn message chính xác cho Guest mode (đang là khoảng 5–10).
- Chuẩn enum `flashcards.review_state`.
- Chính sách xóa tài khoản: soft delete hay hard delete.
- Chính sách làm lại quiz trong MVP.
