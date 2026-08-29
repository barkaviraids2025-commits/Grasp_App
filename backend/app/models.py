from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(40))
    password_hash: Mapped[str] = mapped_column(String(255))
    preferred_language: Mapped[str] = mapped_column(String(20), default="en")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["LearningProfile"] = relationship(back_populates="user", uselist=False)
    plans: Mapped[list["StudyPlan"]] = relationship(back_populates="user")
    badges: Mapped[list["Badge"]] = relationship(back_populates="user")
    game_runs: Mapped[list["GameRun"]] = relationship(back_populates="user")


class LearningProfile(Base):
    __tablename__ = "learning_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    answers_json: Mapped[str] = mapped_column(Text)
    pace: Mapped[str] = mapped_column(String(40))
    focus_window: Mapped[str] = mapped_column(String(40))
    preferred_learning: Mapped[str] = mapped_column(String(120))
    problem_solving: Mapped[str] = mapped_column(String(80))
    retention: Mapped[str] = mapped_column(String(40))
    revision: Mapped[str] = mapped_column(String(40))
    motivation: Mapped[str] = mapped_column(String(80))
    session_minutes: Mapped[int] = mapped_column(Integer)
    best_time: Mapped[str] = mapped_column(String(40))
    explanation_order_json: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)

    user: Mapped[User] = relationship(back_populates="profile")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    source_name: Mapped[str] = mapped_column(String(255))
    deadline_days: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="plans")
    concepts: Mapped[list["Concept"]] = relationship(back_populates="plan")
    sessions: Mapped[list["PlanSession"]] = relationship(back_populates="plan")


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("study_plans.id"))
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text)
    source_excerpt: Mapped[str] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    order_index: Mapped[int] = mapped_column(Integer)
    understood: Mapped[bool] = mapped_column(Boolean, default=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    last_score: Mapped[float] = mapped_column(Float, default=0)
    explanation_index: Mapped[int] = mapped_column(Integer, default=0)

    plan: Mapped[StudyPlan] = relationship(back_populates="concepts")


class PlanSession(Base):
    __tablename__ = "plan_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("study_plans.id"))
    day_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(255))
    minutes: Mapped[int] = mapped_column(Integer)
    kind: Mapped[str] = mapped_column(String(40))
    concept_ids_json: Mapped[str] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    plan: Mapped[StudyPlan] = relationship(back_populates="sessions")


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    key: Mapped[str] = mapped_column(String(80))
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(255))
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="badges")


class GameRun(Base):
    __tablename__ = "game_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    game: Mapped[str] = mapped_column(String(40))
    accuracy: Mapped[float] = mapped_column(Float)
    reaction_ms: Mapped[float] = mapped_column(Float, default=0)
    mistakes: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[int] = mapped_column(Integer)
    profile_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="game_runs")
