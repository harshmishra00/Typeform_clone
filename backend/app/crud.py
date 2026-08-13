import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas, auth

# User CRUD
def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    hashed_pwd = auth.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email.lower().strip(),
        full_name=user_in.full_name or "",
        hashed_password=hashed_pwd
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email.lower().strip()).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

# Form CRUD
def get_forms(db: Session, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    query = db.query(models.Form)
    if user_id:
        query = query.filter(models.Form.owner_id == user_id)
    forms = query.order_by(models.Form.updated_at.desc()).all()
    result = []
    for form in forms:
        q_count = db.query(models.Question).filter(models.Question.form_id == form.id).count()
        r_count = db.query(models.Response).filter(models.Response.form_id == form.id).count()
        result.append({
            "id": form.id,
            "title": form.title,
            "description": form.description or "",
            "status": form.status,
            "theme_color": form.theme_color,
            "created_at": form.created_at,
            "updated_at": form.updated_at,
            "question_count": q_count,
            "response_count": r_count
        })
    return result


def get_form(db: Session, form_id: str) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.id == form_id).first()

def create_form(db: Session, form_in: schemas.FormCreate, owner_id: Optional[str] = None) -> models.Form:
    db_form = models.Form(
        owner_id=owner_id,
        title=form_in.title,
        description=form_in.description or "",
        status=form_in.status or "draft",
        theme_color=form_in.theme_color or "#792F9B",
        font_family=form_in.font_family or "Inter",
        thank_you_title=form_in.thank_you_title or "Thank you for your time!",
        thank_you_message=form_in.thank_you_message or "Your response has been submitted successfully."
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)


    if form_in.questions:
        for idx, q_in in enumerate(form_in.questions):
            q_model = models.Question(
                form_id=db_form.id,
                type=q_in.type,
                title=q_in.title,
                description=q_in.description or "",
                required=q_in.required,
                order=idx,
                choices_json=json.dumps(q_in.choices or []),
                min_val=q_in.min_val,
                max_val=q_in.max_val
            )
            db.add(q_model)
        db.commit()
        db.refresh(db_form)

    return db_form

def update_form(db: Session, form_id: str, form_in: schemas.FormUpdate) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    
    update_data = form_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_form, field, value)
    
    db.commit()
    db.refresh(db_form)
    return db_form

def duplicate_form(db: Session, form_id: str) -> Optional[models.Form]:
    source_form = get_form(db, form_id)
    if not source_form:
        return None
    
    new_form = models.Form(
        title=f"{source_form.title} (Copy)",
        description=source_form.description,
        status="draft",
        theme_color=source_form.theme_color,
        font_family=source_form.font_family,
        thank_you_title=source_form.thank_you_title,
        thank_you_message=source_form.thank_you_message
    )
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    for q in source_form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            order=q.order,
            choices_json=q.choices_json,
            min_val=q.min_val,
            max_val=q.max_val
        )
        db.add(new_q)
    
    db.commit()
    db.refresh(new_form)
    return new_form

def delete_form(db: Session, form_id: str) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True

def sync_questions(db: Session, form_id: str, questions_in: List[schemas.QuestionUpdate]) -> List[models.Question]:
    # Delete existing questions not in update or re-sync all
    db.query(models.Question).filter(models.Question.form_id == form_id).delete()
    db.commit()

    new_questions = []
    for idx, q_in in enumerate(questions_in):
        q_model = models.Question(
            id=q_in.id or models.generate_uuid(),
            form_id=form_id,
            type=q_in.type,
            title=q_in.title,
            description=q_in.description or "",
            required=q_in.required,
            order=idx,
            choices_json=json.dumps(q_in.choices or []),
            min_val=q_in.min_val,
            max_val=q_in.max_val
        )
        db.add(q_model)
        new_questions.append(q_model)
    
    db.commit()
    return new_questions

# Response & Answer CRUD
def submit_response(db: Session, form_id: str, payload: schemas.ResponseSubmit) -> models.Response:
    db_response = models.Response(
        form_id=form_id,
        completion_time_seconds=payload.completion_time_seconds or 0
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)

    for ans in payload.answers:
        db_ans = models.Answer(
            response_id=db_response.id,
            question_id=ans.question_id,
            value_json=json.dumps(ans.value)
        )
        db.add(db_ans)
    
    db.commit()
    db.refresh(db_response)
    return db_response

def get_responses(db: Session, form_id: str) -> List[models.Response]:
    return db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()

def get_response_stats(db: Session, form_id: str) -> List[Dict[str, Any]]:
    questions = db.query(models.Question).filter(models.Question.form_id == form_id).order_by(models.Question.order).all()
    stats = []

    for q in questions:
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        total_answers = len(answers)
        
        q_stat = {
            "question_id": q.id,
            "title": q.title,
            "type": q.type,
            "total_answers": total_answers,
            "choice_counts": None,
            "average_rating": None,
            "numeric_stats": None
        }

        if q.type in ["multiple_choice", "dropdown", "yes_no"]:
            counts = {choice: 0 for choice in q.choices} if q.choices else {}
            if q.type == "yes_no":
                counts = {"Yes": 0, "No": 0}
            
            for ans in answers:
                val = ans.value
                if isinstance(val, list):
                    for item in val:
                        item_str = str(item)
                        counts[item_str] = counts.get(item_str, 0) + 1
                else:
                    val_str = str(val)
                    counts[val_str] = counts.get(val_str, 0) + 1
            q_stat["choice_counts"] = counts

        elif q.type == "rating":
            ratings = []
            for ans in answers:
                try:
                    ratings.append(float(ans.value))
                except Exception:
                    pass
            if ratings:
                q_stat["average_rating"] = round(sum(ratings) / len(ratings), 2)

        elif q.type == "number":
            nums = []
            for ans in answers:
                try:
                    nums.append(float(ans.value))
                except Exception:
                    pass
            if nums:
                q_stat["numeric_stats"] = {
                    "avg": round(sum(nums) / len(nums), 2),
                    "min": min(nums),
                    "max": max(nums)
                }

        stats.append(q_stat)

    return stats
