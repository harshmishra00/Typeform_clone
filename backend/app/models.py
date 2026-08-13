import uuid
from datetime import datetime
import json
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, default="Untitled Form")
    description = Column(String, nullable=True, default="")
    status = Column(String, nullable=False, default="draft")  # "draft" | "published"
    theme_color = Column(String, nullable=False, default="#792F9B")
    font_family = Column(String, nullable=False, default="Inter")
    thank_you_title = Column(String, nullable=False, default="Thank you for your time!")
    thank_you_message = Column(String, nullable=False, default="Your response has been submitted successfully.")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    title = Column(String, nullable=False, default="Untitled Question")
    description = Column(String, nullable=True, default="")
    required = Column(Boolean, default=False)
    order = Column(Integer, nullable=False, default=0)
    choices_json = Column(Text, nullable=True, default="[]")  # JSON array string
    min_val = Column(Integer, nullable=True, default=1)
    max_val = Column(Integer, nullable=True, default=5)

    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

    @property
    def choices(self):
        try:
            return json.loads(self.choices_json) if self.choices_json else []
        except Exception:
            return []

    @choices.setter
    def choices(self, val):
        self.choices_json = json.dumps(val or [])

class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    completion_time_seconds = Column(Integer, nullable=True, default=0)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    response_id = Column(String, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    value_json = Column(Text, nullable=False, default='""')  # JSON formatted string/value

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")

    @property
    def value(self):
        try:
            return json.loads(self.value_json)
        except Exception:
            return self.value_json

    @value.setter
    def value(self, val):
        self.value_json = json.dumps(val)
