# USER STORIES

## Epic 1: Xác thực (Authentication)

### Feature: Đăng ký/Đăng nhập bằng Google và Email

#### User Story
Với vai trò là người học mới,  
tôi muốn đăng ký nhanh bằng Google hoặc email/password,  
để tôi có thể bắt đầu học ngay với ít ma sát nhất.

#### Acceptance Criteria
- Người dùng đăng ký thành công bằng Google OAuth.
- Người dùng đăng ký và đăng nhập thành công bằng email/password.
- Sau khi đăng nhập thành công, người dùng được chuyển tới Home Dashboard.
- Phiên đăng nhập hợp lệ cho các API yêu cầu xác thực.

#### Edge Cases
- Email đã tồn tại khi đăng ký email/password.
- Google OAuth thất bại hoặc người dùng hủy consent.
- Nhập sai password nhiều lần liên tiếp.

#### Technical Notes
- API: `POST /auth/signup`, `POST /auth/login`, `POST /auth/google`, `POST /auth/logout`.
- DB: `users` (auth providers).
- Frontend: quản lý auth state toàn cục, route guard.

#### Priority
- P0

### Feature: Xóa tài khoản và dữ liệu

#### User Story
Với vai trò là người dùng đã đăng ký,  
tôi muốn yêu cầu xóa tài khoản,  
để dữ liệu của tôi được gỡ bỏ khi tôi không còn sử dụng ứng dụng.

#### Acceptance Criteria
- Người dùng có thể gửi yêu cầu xóa tài khoản từ profile/settings.
- Sau khi xóa thành công, tài khoản không thể đăng nhập lại.
- Dữ liệu liên quan của người dùng được xóa hoặc ẩn theo chính sách MVP.
- Người dùng bị đăng xuất ngay sau thao tác xóa tài khoản thành công.

#### Edge Cases
- Mất kết nối trong lúc xóa tài khoản.
- Yêu cầu xóa gửi khi token đã hết hạn.

#### Technical Notes
- API: `DELETE /account`.
- DB liên quan: `users`, `chat_sessions`, `chat_messages`, `flashcards`, `quiz_sets`, `progress_daily`.
- Need clarification: dùng soft delete hay hard delete.

#### Priority
- P1

## Epic 2: Onboarding

### Feature: Onboarding 4 bước cá nhân hóa ban đầu

#### User Story
Với vai trò là người học lần đầu,  
tôi muốn chọn level, mục tiêu, target score và chủ đề yêu thích,  
để phản hồi AI phù hợp với ngữ cảnh học của tôi từ ngày đầu tiên.

#### Acceptance Criteria
- Onboarding có đúng 4 bước theo PRD.
- Người dùng chưa hoàn tất onboarding thì không vào được dashboard.
- Dữ liệu onboarding được lưu vào hồ sơ người dùng.
- Dữ liệu onboarding được đưa vào context prompt cho chat/flashcard/quiz.

#### Edge Cases
- Người dùng thoát app giữa onboarding rồi quay lại.
- Người dùng chọn target score không hợp lệ với mục tiêu đã chọn.

#### Technical Notes
- API: `POST /onboarding`, `GET /me`, `PATCH /me`.
- DB: `users.onboardingSelections`.
- Need clarification: tập giá trị target score hợp lệ theo từng exam.

#### Priority
- P0

## Epic 3: Chatbot - Knowledge Mode

### Feature: Trả lời kiến thức theo nguyên tắc concise-first

#### User Story
Với vai trò là người học có attention span ngắn,  
tôi muốn nhận câu trả lời nhanh và thực dụng ở Knowledge mode,  
để tôi hiểu và áp dụng được trong khoảng 30 giây.

#### Acceptance Criteria
- Mode mặc định khi vào màn chat là `Knowledge`.
- Câu trả lời mặc định ưu tiên < 80 từ.
- Câu trả lời ưu tiên format: giải thích ngắn, công thức/cấu trúc, ví dụ.
- Với câu hỏi đơn giản, AI có thể trả lời compact hơn 3 block.
- Không trả lời dạng essay hoặc textbook dài trong chế độ mặc định.

#### Edge Cases
- Câu hỏi mơ hồ hoặc quá ngắn.
- Người dùng spam cùng một câu hỏi liên tục.
- AI timeout hoặc lỗi provider/model.

#### Technical Notes
- API: `POST /chat/message`.
- DB: `chat_sessions`, `chat_messages`.
- AI: system prompt riêng cho Knowledge mode, rule concise-first.

#### Priority
- P0

### Feature: Explain More mở rộng inline

#### User Story
Với vai trò là người học,  
tôi muốn mở rộng giải thích ngay dưới câu trả lời bằng nút "Explain more",  
để học sâu hơn mà không làm rối luồng chat.

#### Acceptance Criteria
- Mỗi response AI có thể hiển thị nút `Explain more`.
- Khi bấm, phần mở rộng hiển thị ngay dưới response gốc.
- Không tạo message mới độc lập trong luồng chat.
- Nội dung chỉ dài hơn khi có trigger rõ ràng từ người dùng.

#### Edge Cases
- Bấm `Explain more` nhiều lần liên tiếp.
- Response gốc lỗi render, không xác định được parent.

#### Technical Notes
- API: `POST /chat/explain-more`.
- DB: `chat_messages.explain_more_parent_id`.
- Frontend: quản lý state mở rộng theo message id.

#### Priority
- P0

### Feature: Ví dụ phải bám target exam và level

#### User Story
Với vai trò là người học TOEIC hoặc IELTS,  
tôi muốn ví dụ phù hợp target tôi đã chọn,  
để nội dung sát mục tiêu thi và dễ áp dụng hơn.

#### Acceptance Criteria
- TOEIC beginner nhận ví dụ workplace/basic communication, câu ngắn.
- IELTS 6.5 nhận ví dụ academic/semi-academic phù hợp hơn.
- VSTEP B1/B2 nhận ví dụ cân bằng grammar + communication.
- Không trả ví dụ kiểu IELTS cho người dùng TOEIC beginner trong câu trả lời mặc định.

#### Edge Cases
- Người dùng đổi mục tiêu sau onboarding.
- Người dùng hỏi nội dung vượt xa level hiện tại.

#### Technical Notes
- AI prompt dependency: mapping level + exam + target score.
- DB: thông tin onboarding trong `users`.
- Need clarification: chiến lược fallback khi mapping exam/target chưa đủ.

#### Priority
- P0

## Epic 4: Chatbot - Roleplay Mode

### Feature: Roleplay tự nhiên, tránh dead chat

#### User Story
Với vai trò là người học luyện tình huống giao tiếp,  
tôi muốn AI vừa dẫn dắt vừa phản hồi tự nhiên trong roleplay,  
để tôi luyện được hội thoại sát thực tế.

#### Acceptance Criteria
- Người dùng chuyển sang mode `Roleplay` từ segmented tab.
- AI mở đầu tình huống và tiếp tục theo phản hồi của người dùng.
- AI chủ động giữ flow, hạn chế dead chat.
- Từ vựng và độ khó phù hợp level + target exam đã chọn.

#### Edge Cases
- Người dùng trả lời lệch khỏi ngữ cảnh roleplay.
- Người dùng muốn dừng tình huống giữa chừng.
- AI kết thúc hội thoại quá sớm.

#### Technical Notes
- API: dùng chung `POST /chat/message` với metadata mode.
- DB: `chat_messages.mode`.
- AI: prompt riêng cho Roleplay mode.

#### Priority
- P0

### Feature: Chuyển mode realtime trong cùng session

#### User Story
Với vai trò là người học chủ động,  
tôi muốn đổi qua lại giữa Knowledge và Roleplay mà không tạo session mới,  
để quá trình học liền mạch.

#### Acceptance Criteria
- Người dùng đổi mode bất kỳ lúc nào trong cùng một session.
- Không tạo chat session mới khi đổi mode.
- Message mới sử dụng prompt theo mode vừa chọn.

#### Edge Cases
- Đổi mode liên tục khi request trước chưa hoàn tất.
- Mất đồng bộ mode giữa UI và backend.

#### Technical Notes
- API: `POST /chat/message` nhận tham số `mode`.
- DB: `chat_sessions.last_mode`, `chat_messages.mode`.
- Frontend: optimistic mode switch + lock state khi request pending.

#### Priority
- P0

## Epic 5: Hệ thống Flashcard

### Feature: Tạo flashcard từ ngữ cảnh chat

#### User Story
Với vai trò là người học,  
tôi muốn AI tạo flashcard từ cuộc chat và lỗi sai của tôi,  
để ôn lại đúng nội dung vừa học.

#### Acceptance Criteria
- Có thao tác manual `Tạo flashcard`.
- Có auto suggest sau chat khi phát hiện nội dung phù hợp.
- Flashcard lưu đủ các field bắt buộc theo PRD.
- Flashcard có source từ message/context liên quan.

#### Edge Cases
- Không đủ dữ liệu để tạo flashcard.
- Nội dung chat nhiễu hoặc không liên quan tiếng Anh.

#### Technical Notes
- API: `POST /flashcards/generate`.
- DB: `flashcards`.
- AI prompt dependency: extract vocab/grammar/lỗi sai từ `chat_messages`.

#### Priority
- P0

### Feature: Swipe cập nhật trạng thái ôn tập

#### User Story
Với vai trò là người học,  
tôi muốn swipe trái/phải trên flashcard,  
để hệ thống biết nội dung nào tôi đã biết và nội dung nào cần ôn lại.

#### Acceptance Criteria
- Swipe phải cập nhật trạng thái đã biết.
- Swipe trái cập nhật trạng thái cần ôn.
- Card swipe-left xuất hiện lại cuối buổi.
- Card swipe-left xuất hiện lại vào ngày hôm sau.

#### Edge Cases
- Swipe quá nhanh gây duplicate update.
- Card đã bị xóa nhưng UI vẫn gửi swipe event.

#### Technical Notes
- API: `POST /flashcards/:id/swipe`, `GET /flashcards/today`.
- DB: `flashcards.review_state`, `flashcards.difficulty`.
- Need clarification: enum trạng thái chuẩn (`known`, `review`, `due_today_end`, `due_tomorrow`).

#### Priority
- P0

## Epic 6: Hệ thống Quiz

### Feature: Tạo quiz theo lịch sử học và điểm yếu

#### User Story
Với vai trò là người học,  
tôi muốn quiz được tạo từ điểm yếu và lịch sử học của tôi,  
để ôn tập đúng nội dung tôi còn yếu.

#### Acceptance Criteria
- Có nút manual generate quiz.
- Có daily recommended quiz.
- AI có thể suggest quiz sau khi người dùng học đủ nội dung liên quan.
- Quiz có 4 loại: multiple choice, fill in the blank, grammar correction, vocabulary.

#### Edge Cases
- Dữ liệu học quá ít để tạo quiz chất lượng.
- Quiz tạo ra trùng lặp nhiều câu hỏi.

#### Technical Notes
- API: `POST /quizzes/generate`, `GET /quizzes/today`.
- DB: `quiz_sets`, `quiz_items`, tham chiếu `chat_messages`/`flashcards`/`progress_daily`.
- AI prompt dependency: tạo quiz theo weak points.

#### Priority
- P0

### Feature: Chấm điểm ngay và giải thích ngắn

#### User Story
Với vai trò là người học,  
tôi muốn thấy điểm quiz ngay cùng giải thích ngắn,  
để sửa lỗi nhanh sau khi làm bài.

#### Acceptance Criteria
- Sau submit, hiển thị điểm ngay lập tức.
- Mỗi câu hiển thị đúng/sai.
- Có giải thích ngắn cho đáp án.
- Không hiển thị giải thích dài dạng essay ở chế độ mặc định.

#### Edge Cases
- Người dùng submit 2 lần.
- Thiếu đáp án ở một số câu.
- Quiz ở trạng thái không hợp lệ (đã nộp/hết hạn).

#### Technical Notes
- API: `POST /quizzes/:id/submit`.
- DB: `quiz_items.correct_answer`, `quiz_items.explanation`.
- Need clarification: chính sách làm lại quiz trong MVP.

#### Priority
- P0

## Epic 7: Theo dõi tiến độ (Progress Tracking)

### Feature: Theo dõi tiến độ dạng metrics thô

#### User Story
Với vai trò là người học,  
tôi muốn xem các chỉ số tiến độ học của mình,  
để theo dõi độ đều đặn và điểm yếu cần cải thiện.

#### Acceptance Criteria
- Hiển thị tối thiểu: từ đã học, flashcards hoàn thành, quiz accuracy, grammar thường sai, chủ đề yếu, chat activity, streak.
- Dữ liệu được cập nhật theo hoạt động mới trong ngày.
- Daily reset theo local timezone của người dùng.
- Không có "English Level Score" tổng hợp ở MVP.

#### Edge Cases
- Người dùng đổi timezone thiết bị.
- Không có hoạt động trong ngày hiện tại.

#### Technical Notes
- API: `GET /progress/overview`, `GET /progress/weak-points`.
- DB: `progress_daily`, `users.timezone`.
- Need clarification: định nghĩa "từ đã học" để tránh đếm trùng.

#### Priority
- P0

## Epic 8: Dashboard

### Feature: Home Dashboard học tập

#### User Story
Với vai trò là người học quay lại app,  
tôi muốn dashboard có các hành động học rõ ràng,  
để tiếp tục học nhanh mỗi ngày.

#### Acceptance Criteria
- Sau login vào Home Dashboard, không vào thẳng màn chat.
- Dashboard có đủ: Continue Chat, Flashcard hôm nay, Quiz hôm nay, Progress tracking, Recent topics.
- Continue Chat là CTA nổi bật nhất.
- Dashboard vẫn load được khi người dùng chưa có lịch sử dài.

#### Edge Cases
- Người dùng mới chưa có chat/flashcard/quiz.
- Lỗi một widget không làm hỏng toàn bộ dashboard.

#### Technical Notes
- API dependency tổng hợp: chat, flashcard, quiz, progress.
- Frontend: loading/skeleton theo từng widget.

#### Priority
- P0

## Epic 9: Guest Mode

### Feature: Cho phép chat thử trước khi đăng ký

#### User Story
Với vai trò là khách truy cập lần đầu,  
tôi muốn thử chatbot trước khi tạo tài khoản,  
để đánh giá giá trị sản phẩm trước khi đăng ký.

#### Acceptance Criteria
- Guest có thể bắt đầu chat mà chưa cần đăng nhập.
- Guest bị giới hạn số message theo rule MVP.
- Khi hết quota, hiển thị CTA đăng ký/đăng nhập.
- Guest session được lưu tạm 7 ngày.

#### Edge Cases
- Guest đóng trình duyệt rồi quay lại.
- Guest session hết hạn khi đang sử dụng.

#### Technical Notes
- API: `POST /guest/session`.
- DB: `guest_sessions`.
- Need clarification: số lượng message giới hạn chính xác (PRD: khoảng 5–10).

#### Priority
- P0

### Feature: Merge dữ liệu guest khi signup

#### User Story
Với vai trò là guest đã quyết định đăng ký,  
tôi muốn lịch sử chat thử được gộp vào tài khoản mới,  
để không mất ngữ cảnh học ban đầu.

#### Acceptance Criteria
- Sau signup/login, guest history được merge sang user account.
- Session/chat đã merge vẫn truy cập được trong lịch sử chat.
- Merge không tạo duplicate message.

#### Edge Cases
- Guest data đã hết hạn trước lúc signup.
- Merge thất bại giữa chừng do lỗi mạng.

#### Technical Notes
- API: `POST /guest/merge`.
- DB: `guest_sessions`, `chat_sessions`, `chat_messages`.

#### Priority
- P0

## Epic 10: Admin Panel

### Feature: Xem danh sách user và reports

#### User Story
Với vai trò là admin,  
tôi muốn xem danh sách người dùng và báo cáo nội dung,  
để theo dõi vận hành sản phẩm và xử lý vấn đề nội dung.

#### Acceptance Criteria
- Admin xem được danh sách user cơ bản.
- Admin xem được danh sách content reports.
- Report có trạng thái xử lý.

#### Edge Cases
- Report trùng lặp nhiều lần cho cùng nội dung.
- Nội dung gốc đã bị xóa trước khi admin mở report.

#### Technical Notes
- API: `GET /admin/users`, `GET /admin/reports`.
- DB: `users`, `reports`.
- Need clarification: tiêu chí phân quyền admin trong MVP.

#### Priority
- P1

### Feature: Block content đơn giản

#### User Story
Với vai trò là admin,  
tôi muốn block nhanh nội dung có vấn đề,  
để giảm nội dung gây hại trong ứng dụng.

#### Acceptance Criteria
- Admin thực hiện được action block trên report/content.
- Nội dung bị block không hiển thị cho user thường.
- Có log action moderator cơ bản.

#### Edge Cases
- Block nhầm nội dung hợp lệ.
- Nội dung đã được block trước đó.

#### Technical Notes
- API: `POST /admin/reports/:id/action`.
- DB: `reports.status`, `reports.moderator_action`.

#### Priority
- P1

## Epic 11: Analytics Tracking

### Feature: Tracking event sản phẩm cốt lõi

#### User Story
Với vai trò là thành viên product team,  
tôi muốn theo dõi các event chính của sản phẩm,  
để đo activation, retention và conversion.

#### Acceptance Criteria
- Gửi đủ event theo PRD: onboarding/chat/mode/flashcard/quiz/signup.
- Event có `user_id` hoặc `guest_id` tương ứng.
- Event có timestamp và context tối thiểu.
- Dashboard analytics xem được DAU, D7 retention, guest->signup conversion.

#### Edge Cases
- Mất event do adblock hoặc network.
- Duplicate event khi refresh trang.

#### Technical Notes
- Stack: PostHog (chính), GA (traffic web).
- Cần phối hợp tracking ở FE + BE để giảm missing events.

#### Priority
- P0

## Epic 12: AI Personalization

### Feature: Cá nhân hóa theo hồ sơ và lịch sử học

#### User Story
Với vai trò là người học,  
tôi muốn AI điều chỉnh nội dung theo level, target exam và điểm yếu của tôi,  
để trải nghiệm học sát nhu cầu thực tế.

#### Acceptance Criteria
- Chat response dùng context onboarding + chat history.
- Flashcard generation dùng từ vựng/grammar/lỗi sai từ lịch sử.
- Quiz generation ưu tiên chủ đề yếu và lỗi thường gặp.
- AI ưu tiên usefulness over completeness.

#### Edge Cases
- Người dùng mới có rất ít dữ liệu lịch sử.
- Dữ liệu lịch sử mâu thuẫn do đổi mục tiêu nhiều lần.

#### Technical Notes
- DB dependencies: `users`, `chat_messages`, `flashcards`, `progress_daily`.
- AI prompt templates riêng cho chat/flashcard/quiz.
- Assumption needed: cách weight giữa recency và weak points.

#### Priority
- P0

## Epic 13: Settings/Profile

### Feature: Quản lý hồ sơ học tập cơ bản

#### User Story
Với vai trò là người học,  
tôi muốn xem và cập nhật hồ sơ học tập của mình,  
để AI thích nghi khi mục tiêu học thay đổi.

#### Acceptance Criteria
- Người dùng xem được level, mục tiêu, target score, chủ đề đã chọn.
- Người dùng cập nhật được thông tin profile học tập.
- Cập nhật profile có hiệu lực cho các phản hồi tiếp theo.

#### Edge Cases
- Nhập target score không hợp lệ.
- Đổi mục tiêu liên tục trong thời gian ngắn.

#### Technical Notes
- API: `GET /me`, `PATCH /me`.
- DB: `users`.

#### Priority
- P1

### Feature: Timezone theo user cho logic hằng ngày

#### User Story
Với vai trò là người dùng toàn cầu,  
tôi muốn hệ thống reset tiến độ hằng ngày theo timezone của tôi,  
để số liệu phản ánh đúng ngày học thực tế.

#### Acceptance Criteria
- Timezone của user được lưu trong profile.
- Daily quiz/flashcard/progress dùng timezone user để reset.
- Khi timezone thay đổi, hệ thống áp dụng từ chu kỳ mới.

#### Edge Cases
- Thiết bị báo timezone sai.
- Người dùng di chuyển qua nhiều timezone.

#### Technical Notes
- DB: `users.timezone`, `progress_daily`.
- Need clarification: cách xử lý DST.

#### Priority
- P1

## Epic 14: System & Infrastructure

### Feature: Kiến trúc MERN tách FE/BE rõ ràng

#### User Story
Với vai trò là đội phát triển,  
tôi muốn kiến trúc FE/BE rõ ràng trên MERN,  
để ship MVP nhanh và dễ mở rộng lên mobile sau này.

#### Acceptance Criteria
- Frontend chạy Next.js/React và deploy trên Vercel.
- Backend Node.js/Express tách riêng khỏi frontend.
- MongoDB Atlas lưu trữ ổn định cho các entity MVP.
- API contracts thống nhất cho chat/flashcard/quiz/progress/admin.

#### Edge Cases
- Mismatch version API giữa FE và BE.
- Lỗi CORS hoặc token giữa domain frontend/backend.

#### Technical Notes
- Infra: Vercel + Render/Railway/VPS + MongoDB Atlas.
- NFR priority: latency > reliability > cost > security.

#### Priority
- P0

### Feature: Đảm bảo độ trễ phản hồi chat

#### User Story
Với vai trò là người học,  
tôi muốn phản hồi chat có cảm giác realtime,  
để trải nghiệm học nhanh và hữu ích.

#### Acceptance Criteria
- Mục tiêu p50 phản hồi chat khoảng 1–2 giây.
- Mục tiêu vận hành thông thường < 3 giây.
- Nếu timeout, UI hiển thị lỗi và cho phép retry.

#### Edge Cases
- Tải cao làm tăng latency.
- AI provider chậm hoặc lỗi tạm thời.

#### Technical Notes
- API: `POST /chat/message`.
- Frontend: loading state + retry action.
- Assumption needed: SLA production cụ thể theo môi trường deploy.

#### Priority
- P0

## MVP Story List

- P0-01: Đăng ký/đăng nhập (Google + email/password)
- P0-02: Onboarding 4 bước
- P0-03: Knowledge mode concise-first + ví dụ đúng target exam
- P0-04: Explain More mở rộng inline
- P0-05: Roleplay mode + chuyển mode realtime
- P0-06: Flashcard generation + swipe logic
- P0-07: Quiz generation + chấm điểm/giải thích
- P0-08: Progress tracking metrics thô + reset theo local timezone
- P0-09: Home Dashboard
- P0-10: Guest mode + quota + merge sau signup
- P0-11: Analytics event tracking cho funnel chính
- P0-12: AI personalization theo onboarding/history/weak points
- P0-13: Kiến trúc hệ thống + target latency

## Suggested Sprint Breakdown

### Sprint 1 (Core Activation)

- Authentication
- Onboarding
- Dashboard skeleton
- Chat Knowledge mode cơ bản
- Analytics nền tảng (onboarding, chat_started, message_sent)

### Sprint 2 (Core Learning Loop)

- Roleplay mode + mode switch realtime
- Explain More inline
- Flashcard generation + swipe review state
- Quiz generation + scoring/explanations
- Progress tracking overview

### Sprint 3 (Retention + Ops)

- Guest mode + merge
- Admin panel cơ bản
- Tinh chỉnh AI personalization theo weak points/history
- Tối ưu hiệu năng để đạt latency target
- Hoàn thiện analytics (flashcard/quiz/conversion funnel)

## Dependency Mapping

- Onboarding phụ thuộc Authentication.
- Dashboard phụ thuộc API của Chat, Flashcard, Quiz, Progress.
- AI Personalization phụ thuộc Onboarding + Chat History + Progress.
- Flashcard và Quiz phụ thuộc chất lượng dữ liệu chat.
- Guest merge phụ thuộc Guest session storage + Auth.
- Admin panel phụ thuộc luồng tạo report.
- Analytics phụ thuộc instrumentation ở cả FE và BE.

## High-risk Stories

- Duy trì chất lượng concise-first ổn định cho nhiều loại câu hỏi.
- Đảm bảo ví dụ đúng target exam (tránh lệch TOEIC/IELTS style).
- Chuyển mode realtime không lệch context hoặc race condition.
- Merge dữ liệu guest không mất dữ liệu và không duplicate.
- Tạo quiz từ weak points khi dữ liệu còn ít.
- Đạt và giữ latency < 3 giây khi tải tăng.

## Stories Recommended To Cut If Timeline Is Short

- Admin block content mức chi tiết (giữ read-only reports trước).
- Settings nâng cao liên quan timezone behavior phức tạp.
- Analytics nâng cao ngoài KPI cốt lõi.
- Tinh chỉnh roleplay branching phức tạp.
- Streak nâng cao, leaderboard, gamification sâu, email reminder.
