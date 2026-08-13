import csv
import io
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status, Response as FastAPIResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import schemas, crud, models

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

# --- Form Endpoints ---

@app.get("/api/forms", response_model=List[schemas.FormListItem])
def list_forms(db: Session = Depends(get_db)):
    return crud.get_forms(db)

@app.post("/api/forms", response_model=schemas.FormOut, status_code=status.HTTP_201_CREATED)
def create_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db, form_in)

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
