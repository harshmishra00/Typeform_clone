# Typeform Clone — Full-Stack Web Application

A full-stack, visually and functionally near-identical clone of the **Typeform** conversational form-builder and respondent experience built for an SDE Fullstack evaluation.

The application runs end-to-end with pre-seeded surveys, featuring a dynamic drag-and-drop/reorderable form builder, 8 interactive question types, custom themes, authentic one-question-at-a-time respondent canvas with keyboard shortcuts, detailed real-time analytics, submissions view with response details, and CSV data export.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14/16 (TypeScript, App Router, Framer Motion, Tailwind CSS v4, Lucide Icons, Canvas-Confetti)
- **Backend**: FastAPI (Python 3.10+, SQLAlchemy, Pydantic v2, Passlib with Bcrypt, PyJWT for auth)
- **Database**: SQLite (Local Development, as required) / PostgreSQL (Production Deployment)
  - The application was developed and tested locally using **SQLite**, as specifically required for the project. SQLite was used throughout the development lifecycle for database modeling, CRUD operations, authentication, form management, response storage, and application testing.
  - For the production deployment, the database was migrated to **PostgreSQL** to address the limitations of SQLite in a cloud-hosted, multi-user environment.

  ### Why SQLite was used during development
  - SQLite is a lightweight, serverless, file-based relational database that requires virtually no configuration.
  - It allowed rapid local development without requiring a separate database server or external database service.
  - It provided full relational database capabilities required by the application, including tables, relationships, constraints, transactions, and SQL queries.
  - Using SQLite significantly simplified the local development and testing workflow while keeping the application architecture compatible with a production relational database.

  ### Why PostgreSQL was used for production
  Although SQLite is highly suitable for local development and small-scale applications, its file-based architecture introduces limitations when an application is deployed as a production web service.

  - **Concurrent writes**: SQLite uses database-level/file-level locking mechanisms that can become a bottleneck when multiple users or requests attempt to perform write operations concurrently. PostgreSQL is designed to handle high levels of concurrent reads and writes.
  - **Multi-user workloads**: A deployed web application can receive requests from multiple users simultaneously. PostgreSQL provides a more robust concurrency model for handling these workloads.
  - **Cloud deployment**: SQLite stores the database inside a local database file. In cloud environments, the application's filesystem may be ephemeral, meaning files stored on the instance can potentially be lost when the service is redeployed or recreated unless persistent storage is explicitly configured.
  - **Scalability**: PostgreSQL is better suited for applications that may grow in terms of users, requests, database size, and concurrent operations.
  - **Production reliability**: PostgreSQL provides production-oriented features for transaction handling, concurrency control, indexing, connection management, backup strategies, and database administration.
  - **Deployment architecture**: PostgreSQL operates as a dedicated database service, allowing the backend application and database to be managed independently. This is more appropriate for a production deployment than keeping the database as a file inside the application environment.
  - **Future extensibility**: PostgreSQL provides a broader set of database capabilities and makes it easier to extend the application if more complex queries, larger datasets, background processing, analytics, or higher traffic requirements are introduced.

  ### Database Migration
  The database abstraction layer was implemented using **SQLAlchemy**, allowing the application to maintain the same ORM-based data-access architecture while switching the underlying database engine between development and production.

  **Local Development:**
  ```text
  FastAPI
      ↓
  SQLAlchemy
      ↓
  SQLite
      ↓
  Local database file
- **Aesthetics & Design System**: Typeform signature palette (Primary `#faf9fb`, Secondary `#3e3040`, Accent `#3860be`, Brand Purple `#a057bb`), custom premium typography (Twklausanne & Tobias), sleek keyboard badge overlays, custom smooth keyframe animations (`slideUpFade`, `scaleIn`, `shimmer`).

---

## 🚀 Quick Start & First-Run Setup

### 1. Backend Setup (FastAPI)
Open a terminal and navigate to the backend directory:
```bash
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv

# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install python dependencies
pip install -r requirements.txt

# Seed initial course/form data (creates sample surveys with populated responses)
python3 -m app.seed

# Start the FastAPI development server (runs on http://localhost:8080)
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```

### 2. Frontend Setup (Next.js)
In a separate terminal, navigate to the frontend directory:
```bash
cd frontend

# Install Node.js dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the dashboard.

---

## 🗄️ Database Schema & Cascade Relationships

The relational schema is fully normalized and managed via SQLAlchemy (`backend/app/models.py`):

```mermaid
erDiagram
    User ||--o{ Form : owns
    Form ||--o{ Question : contains
    Form ||--o{ Response : receives
    Response ||--o{ Answer : contains
    Question ||--o{ Answer : answers
```

### Cascading & Foreign Key Logic
- **Form -> User (CASCADE)**: Deleting a User cascadingly deletes all forms owned by that user.
- **Question -> Form (CASCADE)**: Deleting a Form deletes all associated questions.
- **Response -> Form (CASCADE)**: Deleting a Form deletes all submissions recorded for it.
- **Answer -> Response (CASCADE)**: Deleting a Response deletes all individual answer entries.
- **Answer -> Question (CASCADE)**: Deleting a Question deletes associated answer rows.

---

## 📡 API Reference Overview

The API supports routing with or without the `/api` prefix to ensure frontend compatibility:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Register a new user account |
| **POST** | `/api/auth/login` | Authenticate user and retrieve JWT |
| **GET** | `/api/auth/me` | Retrieve current authenticated user |
| **GET** | `/api/forms` | List all forms (with question and response counts) |
| **POST** | `/api/forms` | Create a new form template |
| **GET** | `/api/forms/{id}` | Retrieve details of a single form |
| **PUT** | `/api/forms/{id}` | Update form metadata or status (`draft` / `published`) |
| **POST** | `/api/forms/{id}/duplicate` | Duplicate form structure and questions |
| **DELETE** | `/api/forms/{id}` | Delete form, questions, and responses |
| **PUT** | `/api/forms/{id}/questions` | Batch synchronize and reorder questions |
| **POST** | `/api/forms/{id}/submit` | Submit respondent answers to the database |
| **GET** | `/api/forms/{id}/responses` | Retrieve all respondent answers for a form |
| **GET** | `/api/forms/{id}/stats` | Retrieve question-level analytical summaries |
| **GET** | `/api/forms/{id}/responses/export` | Download full response dataset as a CSV file |

---

## ✨ Features & Implementation Details

### 1. Interactive Form Builder
- **Drag-and-Drop Reordering**: Rearrange and sort questions with immediate updates.
- **8 Supported Question Types**:
  - `Short Text` & `Long Text` for text inputs.
  - `Multiple Choice` & `Dropdown` options.
  - `Email` & `Number` fields with real-time validation.
  - `Yes/No` buttons.
  - `Rating` scale (up to 10 stars).
- **Live Preview Pane**: A real-time side-by-side preview panel rendering the exact layout the respondent will experience.
- **Custom Theme Controls**: Customize themes with background colors, accent colors, and custom fonts.

### 2. Conversational Respondent Flow
- **One Question at a Time**: The signature Typeform experience featuring smooth, animated slide-up transitions between questions.
- **Power User Keyboard Shortcuts**:
  - `Enter` key to submit and advance.
  - `Shift + Enter` or `Arrow Up` to return to the previous question.
  - `Arrow Down` to skip/advance.
  - Keyboard hotkeys `[A]`, `[B]`, `[C]` for Multiple Choice or `[Y]` / `[N]` for Yes/No.
- **Dynamic Progress Indicator**: Displays real-time completion status.
- **Celebratory Thank-You Screen**: Fires a screen-wide confetti explosion upon form completion.

### 3. Detailed Response Analytics & Export
- **Aggregated Summaries**: Visual analysis of multiple-choice spreads, rating distributions, and text list drawers.
- **Submissions Grid**: Structured table with detailed submission metadata (time-to-complete, timestamps).
- **One-Click CSV Export**: Streams answers directly to a downloadable `.csv` file.

---

## 🌐 Production Deployment

### 1. Permanent PostgreSQL Database (Neon)
SQLite is ephemeral on cloud platforms like Render. Use Neon (free serverless PostgreSQL) to ensure user data persists forever:
1. Create a project at [neon.tech](https://neon.tech) and copy the Connection String URI.
2. In your local or deployment environment, set the `DATABASE_URL` variable:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:***@ep-cool-name-123.neon.tech/neondb?sslmode=require"
   ```
3. The FastAPI app automatically runs the migrations and creates tables on startup.

### 2. Backend Deployment (Render)
1. Link your GitHub repository to **Render**.
2. Create a new **Web Service** pointed to the `backend` folder.
3. Use the following deployment configuration:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL Connection String.

### 3. Frontend Deployment (Vercel)
1. Add a project on **Vercel** pointing to the `frontend` directory.
2. Set the Environment Variable:
   - `NEXT_PUBLIC_API_URL`: The URL of your live Render backend (e.g., `https://your-backend.onrender.com`).
3. Deploy! Vercel will automatically compile the Next.js App Router project and make it live.
