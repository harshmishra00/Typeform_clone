import csv
import io
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Response as FastAPIResponse

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import schemas, crud, models, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Typeform Clone API",
    description="Backend API powering the Typeform Clone application",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (default port 3000 / 3001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Typeform Clone API is up and running!", "docs": "/docs"}

# --- Authentication Endpoints ---

@app.post("/api/auth/signup", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    user = crud.create_user(db, user_in)
    access_token = auth.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserOut.model_validate(user)
    }

@app.post("/api/auth/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, credentials.email)
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = auth.create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserOut.model_validate(user)
    }

@app.get("/api/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Form Endpoints ---

@app.get("/api/forms", response_model=List[schemas.FormListItem])
def list_forms(
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None
    return crud.get_forms(db, user_id=user_id)

@app.post("/api/forms", response_model=schemas.FormOut, status_code=status.HTTP_201_CREATED)
def create_form(
    form_in: schemas.FormCreate,
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
    db: Session = Depends(get_db)
):
    owner_id = current_user.id if current_user else None
    return crud.create_form(db, form_in, owner_id=owner_id)


@app.get("/api/forms/{form_id}", response_model=schemas.FormOut)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    r_count = db.query(models.Response).filter(models.Response.form_id == form.id).count()
    out = schemas.FormOut.model_validate(form)
    out.response_count = r_count
    return out

@app.put("/api/forms/{form_id}", response_model=schemas.FormOut)
def update_form(form_id: str, form_in: schemas.FormUpdate, db: Session = Depends(get_db)):
    updated_form = crud.update_form(db, form_id, form_in)
    if not updated_form:
        raise HTTPException(status_code=404, detail="Form not found")
    r_count = db.query(models.Response).filter(models.Response.form_id == updated_form.id).count()
    out = schemas.FormOut.model_validate(updated_form)
    out.response_count = r_count
    return out

@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormOut)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    duplicated = crud.duplicate_form(db, form_id)
    if not duplicated:
        raise HTTPException(status_code=404, detail="Form not found")
    return schemas.FormOut.model_validate(duplicated)

@app.delete("/api/forms/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    success = crud.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return None

@app.put("/api/forms/{form_id}/questions", response_model=List[schemas.QuestionOut])
def sync_questions(form_id: str, questions_in: List[schemas.QuestionUpdate], db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    updated_questions = crud.sync_questions(db, form_id, questions_in)
    return [schemas.QuestionOut.model_validate(q) for q in updated_questions]

# --- Respondent & Submission Endpoints ---

@app.post("/api/forms/{form_id}/submit", response_model=schemas.ResponseOut, status_code=status.HTTP_201_CREATED)
def submit_response(form_id: str, payload: schemas.ResponseSubmit, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.status != "published":
        raise HTTPException(status_code=400, detail="Form is not currently published")
    
    response = crud.submit_response(db, form_id, payload)
    return schemas.ResponseOut.model_validate(response)

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.ResponseOut])
def get_responses(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    responses = crud.get_responses(db, form_id)
    return [schemas.ResponseOut.model_validate(r) for r in responses]

@app.get("/api/forms/{form_id}/stats", response_model=List[schemas.QuestionStats])
def get_form_stats(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_response_stats(db, form_id)

@app.get("/api/forms/{form_id}/responses/export")
def export_responses_csv(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    responses = crud.get_responses(db, form_id)
    questions = sorted(form.questions, key=lambda x: x.order)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    headers = ["Response ID", "Submitted At", "Completion Time (s)"] + [f"Q{q.order + 1}: {q.title}" for q in questions]
    writer.writerow(headers)
    
    for r in responses:
        answers_map = {ans.question_id: ans.value for ans in r.answers}
        row = [r.id, r.submitted_at.isoformat(), r.completion_time_seconds]
        for q in questions:
            ans_val = answers_map.get(q.id, "")
            if isinstance(ans_val, list):
                ans_val = ", ".join(map(str, ans_val))
            row.append(str(ans_val) if ans_val is not None else "")
        writer.writerow(row)
    
    output.seek(0)
    filename = f"{form.title.replace(' ', '_').lower()}_responses.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
