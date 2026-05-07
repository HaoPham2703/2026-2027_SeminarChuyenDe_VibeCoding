# Database Schema

## 1. Database Philosophy

- Ưu tiên **MongoDB-first**: document linh hoạt, tối ưu tốc độ phát triển MVP.
- Thiết kế theo hướng **denormalize vừa đủ**, không over-normalize kiểu SQL.
- Tập trung 3 luồng cốt lõi: **Chat -> Flashcard -> Quiz -> Progress**.
- Ưu tiên query nhanh cho:
  - Dashboard
  - Lịch sử chat gần đây
  - Flashcard cần ôn
- Giữ schema đủ mở rộng cho mobile (React Native) nhưng không thêm scope ngoài MVP.

## 2. Collections Overview

Các collection chính trong MVP:

1. `users`
2. `chat_sessions`
3. `chat_messages`
4. `flashcards`
5. `flashcard_reviews`
6. `quizzes`
7. `quiz_attempts`
8. `user_progress`
9. `guest_sessions`
10. `analytics_events`
11. `reports` (bao gồm dữ liệu admin flags/moderation)

## 3. Relationship Overview

- `users (1) - (N) chat_sessions`
- `chat_sessions (1) - (N) chat_messages`
- `users (1) - (N) flashcards`
- `flashcards (1) - (N) flashcard_reviews`
- `users (1) - (N) quizzes` (quiz sinh theo user context)
- `quizzes (1) - (N) quiz_attempts`
- `users (1) - (1) user_progress` (snapshot + counters, cập nhật theo ngày)
- `guest_sessions (1) - (N) chat_messages` (trước khi merge)
- `users/guest_sessions (1) - (N) analytics_events`
- `chat_messages/flashcards/quizzes (1) - (N) reports` (báo cáo nội dung)

## 4. Collection Schemas

> Gợi ý kiểu dữ liệu theo Mongoose. Tên field dùng `snake_case` để đồng bộ với tài liệu hiện tại.

### 4.1 `users`

```js
{
  _id: ObjectId,
  email: String, // unique, sparse
  password_hash: String, // null nếu chỉ dùng Google login
  google_id: String, // unique, sparse
  auth_provider: String, // 'email' | 'google' | 'both'

  display_name: String,
  avatar_url: String,
  user_language: { type: String, default: 'vi' },
  timezone: String, // IANA timezone

  current_level: String, // 'mat_goc' | 'beginner' | 'intermediate' | 'advanced'
  target_exam: String, // 'TOEIC' | 'IELTS' | 'VSTEP' | 'giao_tiep' | 'cong_viec' | 'du_lich'
  target_score: String, // ví dụ 'TOEIC 700', 'IELTS 6.5'
  learning_goals: [String],
  favorite_topics: [String],

  streak: {
    current_days: Number,
    longest_days: Number,
    last_active_date: Date
  },

  guest_conversion: {
    is_converted_from_guest: Boolean,
    guest_session_id: ObjectId,
    converted_at: Date
  },

  onboarding_completed: Boolean,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date // soft delete
}
```

### 4.2 `chat_sessions`

```js
{
  _id: ObjectId,
  user_id: ObjectId, // null nếu guest session
  guest_session_id: ObjectId, // null nếu user thật

  title: String,
  current_mode: String, // 'knowledge' | 'roleplay'
  last_mode: String, // hỗ trợ switch realtime

  message_count: Number,
  last_message_at: Date,

  created_at: Date,
  updated_at: Date,
  deleted_at: Date
}
```

### 4.3 `chat_messages`

```js
{
  _id: ObjectId,
  session_id: ObjectId,
  user_id: ObjectId, // optional để query nhanh theo user
  guest_session_id: ObjectId, // optional

  role: String, // 'user' | 'assistant' | 'system'
  mode: String, // 'knowledge' | 'roleplay'
  content: String,

  explain_more_parent: ObjectId, // message assistant gốc khi mở rộng inline

  ai_metadata: {
    model: String,
    prompt_version: String,
    target_exam_applied: String,
    level_applied: String,
    safety_action: String // 'none' | 'redirect' | 'refuse'
  },

  latency_ms: Number,
  token_usage: {
    input_tokens: Number,
    output_tokens: Number,
    total_tokens: Number
  },

  created_at: Date,
  deleted_at: Date
}
```

### 4.4 `flashcards`

```js
{
  _id: ObjectId,
  user_id: ObjectId,

  term: String,
  meaning_vi: String,
  pronunciation: String,
  example: String,
  synonym: [String],
  grammar_note: String,

  target_exam: String,
  level_tag: String,
  difficulty: String, // 'easy' | 'medium' | 'hard'

  source_message_id: ObjectId, // từ chat nào
  source_type: String, // 'chat' | 'mistake' | 'manual'

  review_state: String, // 'new' | 'known' | 'review'
  next_review_at: Date,
  last_reviewed_at: Date,
  review_count: Number,

  duplicate_key: String, // normalize(term + target_exam + level_tag)

  created_at: Date,
  updated_at: Date,
  deleted_at: Date
}
```

### 4.5 `flashcard_reviews`

```js
{
  _id: ObjectId,
  user_id: ObjectId,
  flashcard_id: ObjectId,

  action: String, // 'swipe_right' | 'swipe_left'
  result_state: String, // 'known' | 'review'
  scheduled_next_review_at: Date,

  reviewed_at: Date
}
```

### 4.6 `quizzes`

```js
{
  _id: ObjectId,
  user_id: ObjectId,

  title: String,
  source: String, // 'manual' | 'daily_recommended' | 'ai_suggested'
  generated_from: {
    weak_topics: [String],
    chat_session_ids: [ObjectId],
    flashcard_ids: [ObjectId]
  },

  target_exam: String,
  level_tag: String,
  difficulty: String, // mức quiz tổng

  questions: [
    {
      question_id: ObjectId,
      type: String, // 'MCQ' | 'fill_in_the_blank' | 'grammar_correction' | 'vocabulary_meaning'
      question: String,
      options: [String],
      correct_answer: String,
      explanation: String,
      skill_tag: String,
      difficulty: String
    }
  ],

  created_at: Date,
  deleted_at: Date
}
```

### 4.7 `quiz_attempts`

```js
{
  _id: ObjectId,
  user_id: ObjectId,
  quiz_id: ObjectId,

  answers: [
    {
      question_id: ObjectId,
      selected_answer: String,
      is_correct: Boolean
    }
  ],

  score: Number, // 0-100
  correct_count: Number,
  total_questions: Number,
  weak_topics: [String],

  completed_at: Date,
  created_at: Date
}
```

### 4.8 `user_progress`

```js
{
  _id: ObjectId,
  user_id: ObjectId, // unique

  learned_words_count: Number,
  flashcards_completed: Number,
  quiz_accuracy: Number, // %
  weak_topics: [String],
  streak_days: Number,
  total_chat_sessions: Number,

  daily_activity: [
    {
      date_key: String, // 'YYYY-MM-DD' theo timezone user
      chat_sessions: Number,
      messages_sent: Number,
      flashcards_reviewed: Number,
      quizzes_completed: Number,
      learned_words: Number
    }
  ],

  updated_at: Date
}
```

### 4.9 `guest_sessions`

```js
{
  _id: ObjectId,
  guest_token: String, // unique

  message_limit: Number, // cấu hình 5-10
  message_used: Number,

  temporary_chat_session_ids: [ObjectId],

  expires_after_days: Number, // default 7
  expires_at: Date,

  merge_on_signup: {
    merged: Boolean,
    merged_user_id: ObjectId,
    merged_at: Date
  },

  created_at: Date,
  updated_at: Date
}
```

### 4.10 `analytics_events`

```js
{
  _id: ObjectId,
  event_name: String, // onboarding_complete, chat_started...

  user_id: ObjectId, // null nếu guest
  guest_session_id: ObjectId, // null nếu user
  session_id: ObjectId, // chat session nếu có

  properties: Mixed, // object linh hoạt cho event payload
  context: {
    platform: String, // 'web'
    user_level: String,
    target_exam: String
  },

  event_at: Date,
  created_at: Date
}
```

### 4.11 `reports` (admin_flags)

```js
{
  _id: ObjectId,

  reporter_user_id: ObjectId, // optional
  source_type: String, // 'chat_message' | 'flashcard' | 'quiz'
  source_id: ObjectId,

  reason: String, // toxic | nsfw | spam | out_of_scope | other
  note: String,

  status: String, // 'open' | 'reviewing' | 'resolved' | 'rejected'
  admin_flags: [
    {
      action: String, // 'block_content' | 'dismiss'
      admin_id: ObjectId,
      action_note: String,
      action_at: Date
    }
  ],

  created_at: Date,
  updated_at: Date
}
```

## 5. Embedded vs Referenced Design

- **Embedded**
  - `quizzes.questions`: embedded để đọc 1 lần là đủ toàn bộ đề.
  - `user_progress.daily_activity`: embedded mảng giới hạn (rolling window) để render dashboard nhanh.
  - `reports.admin_flags`: embedded vì số action trên 1 report thường nhỏ.

- **Referenced**
  - `chat_sessions` -> `chat_messages`: tách riêng để tránh document quá lớn.
  - `flashcards` -> `flashcard_reviews`: tách lịch sử review để không phình card.
  - `quizzes` -> `quiz_attempts`: tách attempt để giữ quiz gốc immutable.

## 6. Index Strategy

### `users`
- `{ email: 1 }` unique sparse
- `{ google_id: 1 }` unique sparse
- `{ created_at: -1 }`

### `chat_sessions`
- `{ user_id: 1, updated_at: -1 }` (recent chats)
- `{ guest_session_id: 1, updated_at: -1 }`
- `{ last_message_at: -1 }`

### `chat_messages`
- `{ session_id: 1, created_at: 1 }` (load hội thoại theo thứ tự)
- `{ user_id: 1, created_at: -1 }`
- `{ explain_more_parent: 1 }`

### `flashcards`
- `{ user_id: 1, next_review_at: 1, review_state: 1 }` (flashcard due lookup)
- `{ user_id: 1, duplicate_key: 1 }` unique (duplicate prevention)
- `{ source_message_id: 1 }`

### `flashcard_reviews`
- `{ flashcard_id: 1, reviewed_at: -1 }`
- `{ user_id: 1, reviewed_at: -1 }`

### `quizzes`
- `{ user_id: 1, created_at: -1 }`
- `{ user_id: 1, source: 1, created_at: -1 }`

### `quiz_attempts`
- `{ user_id: 1, completed_at: -1 }` (quiz history)
- `{ quiz_id: 1, completed_at: -1 }`

### `user_progress`
- `{ user_id: 1 }` unique

### `guest_sessions`
- `{ guest_token: 1 }` unique
- `{ expires_at: 1 }` TTL index

### `analytics_events`
- `{ event_name: 1, event_at: -1 }`
- `{ user_id: 1, event_at: -1 }`
- `{ guest_session_id: 1, event_at: -1 }`

### `reports`
- `{ status: 1, created_at: -1 }`
- `{ source_type: 1, source_id: 1 }`

## 7. Query Optimization Notes

- Dashboard API nên đọc từ:
  - `user_progress` (snapshot metrics)
  - `chat_sessions` (recent)
  - `flashcards` theo `next_review_at`
  - `quizzes` mới nhất
- Chat history:
  - Page theo `chat_sessions.updated_at desc`.
  - Trong session: query `chat_messages` theo `{session_id, created_at}`.
- Flashcard review:
  - Query due cards bằng index `user_id + next_review_at + review_state`.
- Quiz history:
  - Query từ `quiz_attempts` theo `completed_at desc`.
- Analytics:
  - Dùng `event_name + event_at` cho dashboard nhanh, tránh full scan.

## 8. Data Lifecycle Rules

- **Soft delete**:
  - `users`, `chat_sessions`, `chat_messages`, `flashcards`, `quizzes` dùng `deleted_at`.
  - Giúp khôi phục nhanh khi thao tác nhầm trong MVP.
- **Hard delete**:
  - `guest_sessions` hết hạn qua TTL.
  - `analytics_events` cũ có thể cleanup theo policy (ví dụ > 180 ngày) bằng job định kỳ.
- **Orphan handling**:
  - Khi soft delete `chat_sessions`, không xóa cứng `chat_messages` ngay.
  - Khi hard delete user (nếu áp dụng), chạy background cleanup theo `user_id`.

Need clarification:
- Chính sách cuối cùng cho xóa account: chỉ soft delete hay hard delete toàn bộ.

## 9. Guest Session Strategy

- Guest được tạo `guest_sessions` với:
  - `message_limit`
  - `message_used`
  - `expires_at` (mặc định 7 ngày)
- Chat guest lưu như session/message bình thường nhưng gắn `guest_session_id`.
- Khi signup:
  - set `merge_on_signup.merged=true`
  - re-assign `chat_sessions.user_id` và `chat_messages.user_id`.
- TTL tự dọn guest chưa merge.

Need clarification:
- Giới hạn chính xác `message_limit` (5 hay 10 hay cấu hình theo env).

## 10. Analytics/Event Tracking Schema

`analytics_events` giữ cấu trúc linh hoạt:

- `event_name`: tên event chuẩn
- `properties`: payload theo event
- `context`: thông tin chung để filter dashboard

Events chính:
- `onboarding_complete`
- `chat_started`
- `flashcard_generated`
- `flashcard_reviewed`
- `quiz_completed`
- `explain_more_clicked`
- `guest_signup_conversion`

Khuyến nghị:
- Validate `event_name` bằng enum mềm ở app layer.
- `properties` dùng object tự do để tránh migration liên tục.

## 11. Admin Data Requirements

- Dùng `reports` làm nguồn dữ liệu admin moderation cơ bản.
- Admin cần:
  - list report theo `status`
  - xem nguồn report (`source_type`, `source_id`)
  - ghi action vào `admin_flags`
- Không triển khai RBAC phức tạp trong MVP.

Need clarification:
- `admin_id` map về user thường có role hay account admin tách riêng.

## 12. Future Scalability Notes

- **React Native**: schema hiện tại dùng REST-friendly id references, tái sử dụng tốt cho mobile.
- **Vector search**: có thể bổ sung `embedding` collection sau, không thêm vào MVP.
- **AI memory**: có thể thêm summarized memory theo user/session trong phase sau.
- **Recommendation engine**: có thể xây trên `analytics_events` + `user_progress`.
- **Multi-language support**: đã có `user_language`, có thể mở rộng i18n sau.

Không triển khai các phần trên ngay trong MVP schema.

---

## Assumption needed

1. Enum chính xác cho `flashcards.review_state` (`new|known|review` là giả định hiện tại).
2. Chính sách retention `analytics_events` (đề xuất 180 ngày nhưng chưa chốt).
3. Cửa sổ lưu `user_progress.daily_activity` (đề xuất rolling 60-90 ngày).
