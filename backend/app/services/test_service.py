import random
import json
import secrets
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.question import Question
from app.models.test import TestSession, TestResult, TestResultAnswer
from app.models.user import User
from app.schemas.test import StartTestRequest, StartTestResponse, SubmitTestRequest, QuestionInTest
from app.redis_client import get_redis

PENDING_TEST_TTL = 7200  # 2 hours — matches longest test (annual)

DAILY_COUNT = 10
ANNUAL_COUNT = 50
DAILY_TIME_SEC = 600
ANNUAL_TIME_SEC = 3600
DAILY_PASS_PCT = 70
ANNUAL_PASS_PCT = 80
PROTOCOL_LESSON_COUNT = 10
PROTOCOL_LESSON_TIME_SEC = 600
PROTOCOL_LESSON_PASS_PCT = 70


def _redis_key(token: str) -> str:
    return f"pending_test:{token}"


def _store_pending(token: str, data: dict):
    r = get_redis()
    r.setex(_redis_key(token), PENDING_TEST_TTL, json.dumps(data))


def _pop_pending(token: str) -> dict | None:
    r = get_redis()
    key = _redis_key(token)
    raw = r.getdel(key)
    return json.loads(raw) if raw else None


def _build_questions(questions: list[Question]) -> list[QuestionInTest]:
    return [
        QuestionInTest(
            id=q.id,
            text=q.text,
            options=[q.option_1, q.option_2, q.option_3, q.option_4],
            image_url=q.image_url,
            category_id=q.category_id,
        )
        for q in questions
    ]


def start_test(db: Session, user: User, req: StartTestRequest) -> StartTestResponse:
    test_type = req.type

    if test_type == "daily":
        categories = ["specifics", "medical", "fire", "labour", "electro"]
        per_cat = DAILY_COUNT // len(categories)
        questions = []
        for cat in categories:
            qs = db.query(Question).filter(
                Question.category_id == cat,
                Question.is_active == True,
            ).all()
            questions.extend(random.sample(qs, min(per_cat, len(qs))))
        title = "Ежедневная проверка"
        time_limit = DAILY_TIME_SEC
        pass_pct = DAILY_PASS_PCT

    elif test_type == "annual":
        categories = ["specifics", "medical", "fire", "labour", "electro"]
        per_cat = ANNUAL_COUNT // len(categories)
        questions = []
        for cat in categories:
            qs = db.query(Question).filter(
                Question.category_id == cat,
                Question.is_active == True,
            ).all()
            questions.extend(random.sample(qs, min(per_cat, len(qs))))
        title = "Ежегодная проверка"
        time_limit = ANNUAL_TIME_SEC
        pass_pct = ANNUAL_PASS_PCT

    elif test_type == "protocol":
        qs = db.query(Question).filter(Question.is_active == True).all()
        questions = random.sample(qs, min(PROTOCOL_LESSON_COUNT, len(qs)))
        title = f"Протокол: {req.protocol_id or 'Общий'}"
        time_limit = PROTOCOL_LESSON_TIME_SEC
        pass_pct = PROTOCOL_LESSON_PASS_PCT

    elif test_type == "lesson":
        base_q = db.query(Question).filter(Question.is_active == True)
        if req.category_id:
            base_q = base_q.filter(Question.category_id == req.category_id)
        qs = base_q.all()
        questions = random.sample(qs, min(PROTOCOL_LESSON_COUNT, len(qs)))
        title = f"Урок: {req.lesson_id or 'Общий'}"
        time_limit = PROTOCOL_LESSON_TIME_SEC
        pass_pct = PROTOCOL_LESSON_PASS_PCT

    elif test_type == "standard" and req.session_id:
        session = db.query(TestSession).filter(TestSession.id == req.session_id).first()
        if not session:
            raise ValueError("Test session not found")
        qs = db.query(Question).filter(Question.is_active == True).all()
        questions = random.sample(qs, min(session.question_count, len(qs)))
        title = session.title
        time_limit = session.time_limit_sec
        pass_pct = session.pass_pct
    else:
        raise ValueError(f"Unknown test type: {test_type}")

    token = secrets.token_urlsafe(32)
    _store_pending(token, {
        "user_id": user.id,
        "test_type": test_type,
        "title": title,
        "correct_map": {str(q.id): q.correct_index for q in questions},
        "question_texts": {str(q.id): q.text for q in questions},
        "pass_pct": pass_pct,
        "session_id": req.session_id,
    })

    return StartTestResponse(
        session_token=token,
        test_type=test_type,
        title=title,
        questions=_build_questions(questions),
        time_limit_sec=time_limit,
        pass_pct=pass_pct,
        total=len(questions),
    )


def submit_test(db: Session, session_token: str, req: SubmitTestRequest) -> TestResult:
    pending = _pop_pending(session_token)
    if not pending:
        raise ValueError("Test session expired or not found")

    correct_map = {int(k): v for k, v in pending["correct_map"].items()}
    question_texts = {int(k): v for k, v in pending.get("question_texts", {}).items()}
    answers_data = {a.question_id: a.selected_index for a in req.answers}

    score = 0
    total = len(correct_map)
    answer_records = []

    for q_id, correct_idx in correct_map.items():
        selected = answers_data.get(q_id, -1)
        is_correct = selected == correct_idx
        if is_correct:
            score += 1
        answer_records.append(TestResultAnswer(
            question_id=q_id,
            question_text=question_texts.get(q_id, f"Question {q_id}"),
            selected_index=max(selected, 0),
            correct_index=correct_idx,
            is_correct=is_correct,
        ))

    pct = round(score / total * 100) if total > 0 else 0
    passed = pct >= pending["pass_pct"]

    result = TestResult(
        user_id=pending["user_id"],
        session_id=pending.get("session_id"),
        test_type=pending["test_type"],
        title=pending["title"],
        score=score,
        total=total,
        pct=pct,
        passed=passed,
        duration_sec=req.duration_sec,
        app_source="spektr",
    )
    db.add(result)
    db.flush()

    for ar in answer_records:
        ar.result_id = result.id
        db.add(ar)

    if pending["test_type"] == "daily":
        db.query(User).filter(User.id == pending["user_id"]).update({"daily_done_today": True})

    db.commit()
    db.refresh(result)
    return result
