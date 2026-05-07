# Engineering Rules

## 1. Engineering Philosophy

- Startup-first, MVP-first, build-fast.
- Readable > clever.
- Consistency > perfection.
- Practical > academic.
- Tránh tối ưu sớm, ưu tiên chạy được end-to-end.
- Code phải đủ sạch để maintain và onboarding nhanh.

## 2. Product Philosophy Rules

- Mọi implementation phải giữ đúng behavior sản phẩm:
1. concise-first
2. practical
3. non-academic
4. không essay dài
5. có ví dụ nhanh khi phù hợp
6. phản hồi nhanh

- Không được:
1. Biến app thành ChatGPT clone.
2. Trả lời paragraph dài mặc định.
3. Thêm AI complexity ngoài scope MVP.

## 3. Architecture Rules

- Bắt buộc:
1. MERN architecture.
2. REST API.
3. Backend modular.
4. Separation of concerns rõ ràng.
5. Reusable services vừa đủ.

- Không dùng:
1. Microservices.
2. CQRS.
3. Event-driven/distributed architecture phức tạp.
4. Kubernetes-level complexity.

## 4. Frontend Rules

- Stack chuẩn:
1. Next.js
2. TailwindCSS
3. responsive-first, mobile-first

- Rules:
1. Component nhỏ, tái sử dụng được.
2. Tránh giant components/page files.
3. Loading state bắt buộc cho API actions.
4. Empty state bắt buộc cho list/data trống.
5. Optimistic UI khi hợp lý (chat send, flashcard swipe).
6. Business logic không hardcode trong UI.
7. Tránh duplicated logic inline.

## 5. Backend Rules

- Pattern bắt buộc:
1. route -> controller -> service.
2. Business logic nằm ở service layer.
3. Validation bắt buộc ở boundary.
4. Centralized error handling.

- Không được:
1. Nhét business logic vào route.
2. Controller quá lớn.
3. Gọi AI lặp lại không cần thiết.
4. Copy-paste logic giữa modules.

## 6. AI Integration Rules

- Source of truth: `SYSTEM_PROMPTS.md`.
- Prompt templates phải centralized (không rải rác).
- Runtime variables phải rõ format.
- Enforce concise-first ở backend trước khi trả UI.
- Token optimization là bắt buộc.

- Không được:
1. Hardcode prompt trong controller.
2. Tạo prompt inline tùy hứng ở nhiều nơi.
3. Inject toàn bộ chat history không kiểm soát.
4. Lưu raw prompt/response quá mức không cần thiết.

## 7. Database Rules

- MongoDB/Mongoose rules:
1. Schema rõ ràng, có timestamps.
2. Index cho field query thường xuyên.
3. Denormalize vừa đủ, không over-normalize.
4. Tránh embedded documents quá lớn.
5. Tránh populate chain sâu.

- Naming:
1. Collection và field nhất quán theo chuẩn đã chọn.

- Không được:
1. Inconsistent schema naming.
2. Lưu dữ liệu AI raw dư thừa.

## 8. API Design Rules

- API phải:
1. REST naming nhất quán.
2. Version-ready (prefix được khi cần).
3. Response format thống nhất.
4. Error format thống nhất.

- Response chuẩn gợi ý:
```json
{
  "success": true,
  "message": "string",
  "data": {},
  "meta": {}
}
```

- Không được:
1. Trả response shape mỗi endpoint một kiểu.
2. Mixed naming conventions.

## 9. State Management Rules

- Ưu tiên:
1. Local state cho UI cục bộ.
2. Server state tách riêng (React Query/SWR).
3. Global state chỉ khi thật sự cần.

- Không được:
1. Dùng Redux complexity sớm khi chưa cần.
2. Duplicated state sources gây lệch dữ liệu.

## 10. Folder Structure Rules

- Cả frontend/backend dùng cấu trúc theo feature/module.
- Import paths phải rõ ràng, tránh vòng phụ thuộc.
- Shared code phải có owner rõ.

- Không được:
1. Dump mọi thứ vào `utils`.
2. Tạo giant shared folder vô tổ chức.

## 11. Naming Convention Rules

- Quy tắc chung:
1. Tên rõ nghĩa, ngắn gọn.
2. Một domain dùng một cách đặt tên.
3. Không viết tắt khó hiểu.

- Gợi ý:
1. Files React component: `PascalCase`.
2. Hooks: `useXxx`.
3. Services/controllers/routes: `camelCase` theo JS convention.
4. API path: `kebab-case` hoặc chuẩn REST nhất quán.

Need clarification:
- Chuẩn naming cuối cùng cho field DB: `snake_case` hay `camelCase` trong code mapping.

## 12. Error Handling Rules

- Bắt buộc:
1. Graceful AI failure.
2. Timeout handling.
3. Retry strategy cơ bản.
4. User-facing error message ngắn, dễ hiểu.

- Không expose:
1. Raw stack trace cho client.
2. AI provider internals.
3. Sensitive config/token.

## 13. Performance Rules

- Target:
1. Chat response <3s (ideal 1-2s).
2. Dashboard load nhanh, widget tách rời.
3. Tránh rerender không cần thiết.
4. Lazy load khi hợp lý.

- Không tối ưu sớm:
1. Không thêm cache/queue phức tạp khi chưa có dữ liệu nghẽn thật.

## 14. Security Rules

- MVP security bắt buộc:
1. JWT auth.
2. Password hashing.
3. Rate limiting cơ bản.
4. Input validation/sanitization.
5. Sanitize prompt inputs.

- Không cần:
1. Enterprise security stack phức tạp ngoài scope MVP.

## 15. Analytics Rules

- Bắt buộc track:
1. onboarding
2. chat usage
3. flashcard usage
4. quiz completion
5. explain_more usage
6. guest -> signup conversion

- Không track:
1. Personal data không cần thiết.
2. Nội dung nhạy cảm vượt mục tiêu analytics MVP.

## 16. Testing Rules

- Minimum bắt buộc:
1. Smoke tests cho flow chính.
2. API validation tests.
3. Critical workflow tests (chat, flashcard, quiz, guest merge).

- Không cần:
1. Enterprise QA pipeline nặng.
2. Testing infra quá mức cho MVP.

## 17. Git & Commit Rules

- Commit style:
1. concise
2. feature-based
3. scoped message

- Ví dụ:
1. `feat(chat): add explain more endpoint`
2. `fix(quiz): handle empty generation`

- Branch naming:
1. `feature/*`
2. `fix/*`
3. `refactor/*`

- PR rule:
1. Nhỏ, tập trung một mục tiêu.
2. Có test notes ngắn.

## 18. Anti-Patterns

- Không được:
1. Over-engineer.
2. Abstraction không cần thiết.
3. Premature optimization.
4. Giant components.
5. Giant services.
6. Tightly coupled AI logic.
7. Duplicated prompts.
8. Feature creep.

## 19. Scope Protection Rules

- Nếu feature không nằm trong:
1. `PRD.md`
2. `MVP_SCOPE.md`
3. `USERSTORIES.md`

=> Không implement.

- Khi chưa chắc:
1. Gắn `Need clarification` hoặc `Assumption needed`.
2. Thêm TODO có ngữ cảnh rõ.
3. Không tự mở rộng sản phẩm.

## 20. Definition of Acceptable Code

- Code được xem là đạt khi:
1. Dễ đọc, nhất quán.
2. Typed/schema rõ ràng.
3. Không dead code.
4. Không duplicate lớn.
5. Đúng folder structure rules.
6. Production-safe ở mức MVP.

- AI behavior được xem là đạt khi:
1. Giữ concise-first.
2. Không trả lời essay mặc định.
3. Ví dụ phù hợp level/target exam.
4. Explain more hoạt động inline đúng flow.

- UX/hiệu năng được xem là đạt khi:
1. Chat đa số phản hồi <3s.
2. Không vỡ layout mobile ở màn hình chính.
3. Loading/empty/error states đầy đủ.

- Ưu tiên cuối cùng:
1. Shipping velocity.
2. Maintainability vừa đủ.
3. UX sạch, thực dụng.
