from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class QuestionBase(BaseModel):
    type: str
    title: str
    description: Optional[str] = ""
    required: bool = False
    order: int = 0
    choices: Optional[List[str]] = []
    min_val: Optional[int] = 1
    max_val: Optional[int] = 5

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    id: Optional[str] = None

class QuestionOut(QuestionBase):
    id: str
    form_id: str

    class Config:
        from_attributes = True

class FormBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "draft"
    theme_color: Optional[str] = "#792F9B"
    font_family: Optional[str] = "Inter"
    thank_you_title: Optional[str] = "Thank you for your time!"
    thank_you_message: Optional[str] = "Your response has been submitted successfully."

class FormCreate(FormBase):
    questions: Optional[List[QuestionCreate]] = []

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    theme_color: Optional[str] = None
    font_family: Optional[str] = None
    thank_you_title: Optional[str] = None
    thank_you_message: Optional[str] = None

class FormOut(FormBase):
    id: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionOut] = []
    response_count: int = 0

    class Config:
        from_attributes = True

class FormListItem(BaseModel):
    id: str
    title: str
    description: str
    status: str
    theme_color: str
    created_at: datetime
    updated_at: datetime
    question_count: int
    response_count: int

    class Config:
        from_attributes = True

class AnswerInput(BaseModel):
    question_id: str
    value: Any

class ResponseSubmit(BaseModel):
    answers: List[AnswerInput]
    completion_time_seconds: Optional[int] = 0

class AnswerOut(BaseModel):
    id: str
    question_id: str
    value: Any

class ResponseOut(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time_seconds: Optional[int] = 0
    answers: List[AnswerOut] = []

    class Config:
        from_attributes = True

class QuestionStats(BaseModel):
    question_id: str
    title: str
    type: str
    total_answers: int
    choice_counts: Optional[Dict[str, int]] = None
    average_rating: Optional[float] = None
    numeric_stats: Optional[Dict[str, float]] = None
