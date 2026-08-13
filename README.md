# Typeform Clone — Full-Stack Web Application

A full-stack clone of **Typeform** replicating Typeform's design aesthetics, user experience, drag-and-drop builder, and signature **one-question-at-a-time conversational respondent flow**.

![Typeform Clone Banner](https://www.typeform.com/favicon.ico)

---

## 🚀 Key Features

### 1. Interactive Form Builder
- **Drag-and-Drop / Reordering Questions**: Add, edit, reorder, and delete questions with instant updates.
- **8 Question Types Supported**:
  - `Short Text`: Single-line text responses.
  - `Long Text`: Multi-line paragraph responses.
  - `Multiple Choice`: Option cards with keyboard shortcut badges `[A]`, `[B]`, `[C]`.
  - `Dropdown`: Filterable select menu.
  - `Email`: Email format validation.
  - `Number`: Numeric input.
  - `Yes/No`: Interactive `[Y] Yes` or `[N] No` buttons.
  - `Rating`: Star rating score scale (3, 5, or 10 stars).
- **Per-Question Settings**: Required toggle, title, help text / description, choices editor.
- **Live Preview Pane**: Real-time side-by-side mirror showing exact respondent appearance.
- **Custom Themes**: Custom accent colors, font selections, and Thank-You screen copy.

### 2. Public Respondent Flow (The Signature Typeform Experience)
- **One Question at a Time**: Full-screen canvas with smooth animated slide-up transitions.
- **Keyboard Shortcuts & Navigation**:
  - `Enter`: Advance / Submit answer.
  - `Shift + Enter` or `Arrow Up`: Go to previous question.
  - `Arrow Down`: Advance to next question.
  - `A`, `B`, `C`, `D` or `1`, `2`, `3`: Select options directly via keyboard.
  - `Y` or `N`: Quick selection for Yes/No questions.
- **Real-Time Progress Bar**: Percentage completion indicator and question counter.
- **Validation**: Client + server validation for required fields, email format, and number ranges.
- **Celebratory Thank You Screen**: Confetti celebration trigger upon completion.
- **Shareable Public Link**: `/to/[formId]` requiring zero login or authentication.

### 3. Form Management & Response Analytics
- **CRUD Operations**: Create, rename, duplicate, publish/unpublish, and delete forms.
- **Summary Analytics**: Percentage breakdowns for choice questions, average star rating badges, and min/max numeric statistics.
- **Submissions Table**: List of responses with completion time, timestamps, and full response drawer.
- **CSV Export**: One-click download of all form submissions as `.csv`.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 (TypeScript), React 18, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2.
- **Database**: SQLite3 (`typeform.db`).

---

## 🗄️ Database Schema

### `forms`
- `id` (String, PK): UUID primary key.
- `title` (String): Form title.
- `description` (String): Form description / subtitle.
- `status` (String): `"draft"` or `"published"`.
- `theme_color` (String): Hex color code (e.g. `#792F9B`).
- `font_family` (String): Font family.
- `thank_you_title` (String): Custom completion header.
- `thank_you_message` (String): Custom completion message.
- `created_at` / `updated_at` (DateTime): Timestamps.

### `questions`
- `id` (String, PK): UUID primary key.
- `form_id` (String, FK): Foreign key referencing `forms.id`.
- `type` (String): Question type identifier.
- `title` (String): Question statement.
- `description` (String): Help text.
- `required` (Boolean): Flag requiring answer.
- `order` (Integer): Display sequence.
- `choices_json` (Text): JSON array of option choices.
- `min_val` / `max_val` (Integer): Rating or numeric bounds.

### `responses`
- `id` (String, PK): UUID primary key.
- `form_id` (String, FK): Foreign key referencing `forms.id`.
- `submitted_at` (DateTime): Timestamp of submission.
- `completion_time_seconds` (Integer): Time taken to fill out form.

### `answers`
- `id` (String, PK): UUID primary key.
- `response_id` (String, FK): Foreign key referencing `responses.id`.
- `question_id` (String, FK): Foreign key referencing `questions.id`.
- `value_json` (Text): JSON encoded answer value.

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/forms` | `GET` | List all forms with question & response counts |
| `/api/forms` | `POST` | Create a new form |
| `/api/forms/{id}` | `GET` | Get form details and questions |
| `/api/forms/{id}` | `PUT` | Update form properties or publish status |
| `/api/forms/{id}/duplicate` | `POST` | Duplicate form and questions |
| `/api/forms/{id}` | `DELETE` | Delete form and related responses |
| `/api/forms/{id}/questions` | `PUT` | Batch update & reorder questions |
| `/api/forms/{id}/submit` | `POST` | Submit public form response |
| `/api/forms/{id}/responses` | `GET` | Fetch form responses |
| `/api/forms/{id}/stats` | `GET` | Get question summary statistics |
| `/api/forms/{id}/responses/export` | `GET` | Export responses as CSV file |

---

## ⚙️ Setup & Running Instructions

### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed SQLite database with pre-built forms & responses
python3 -m app.seed

# Start FastAPI server on port 8080
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```

### 2. Frontend Setup (Next.js TypeScript)
```bash
cd frontend
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using the Typeform application!
