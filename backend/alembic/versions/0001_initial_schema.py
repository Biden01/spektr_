"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-05-06 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Enums (PostgreSQL only) ---
    user_role = sa.Enum("employee", "master", "admin", "student", name="user_role")
    app_source_enum = sa.Enum("spektr", "workhelper", "both", name="app_source")
    user_status = sa.Enum("active", "vacation", "sick", name="user_status")
    user_state = sa.Enum("all_ok", "overdue", name="user_state")
    clearance_status = sa.Enum("active", "expiring", "expired", name="clearance_status")

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("slug", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("initials", sa.String(), nullable=True),
        sa.Column("tab_number", sa.String(), unique=True, nullable=True),
        sa.Column("phone", sa.String(), unique=True, nullable=True),
        sa.Column("email", sa.String(), unique=True, nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("role", user_role, nullable=False, server_default="employee"),
        sa.Column("app_source", app_source_enum, nullable=False, server_default="both"),
        sa.Column("position", sa.String(), nullable=True),
        sa.Column("section", sa.String(), nullable=True),
        sa.Column("profession", sa.String(), nullable=True),
        sa.Column("access_group", sa.String(), nullable=True),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("status", user_status, nullable=False, server_default="active"),
        sa.Column("state", user_state, nullable=False, server_default="all_ok"),
        sa.Column("enrolled_course_id", sa.String(), nullable=True),
        sa.Column("daily_done_today", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("annual_due_days", sa.Integer(), nullable=True),
        sa.Column("medical_due_days", sa.Integer(), nullable=True),
        sa.Column("hire_date", sa.Date(), nullable=True),
        sa.Column("last_active", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # --- subordinates (join table) ---
    op.create_table(
        "subordinates",
        sa.Column("master_id", sa.Integer(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("subordinate_id", sa.Integer(), sa.ForeignKey("users.id"), primary_key=True),
    )

    # --- user_medical_info ---
    op.create_table(
        "user_medical_info",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True),
        sa.Column("blood_type", sa.String(), nullable=True),
        sa.Column("average_blood_pressure", sa.String(), nullable=True),
    )

    # --- medical_clearances ---
    op.create_table(
        "medical_clearances",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("expiry_date", sa.Date(), nullable=False),
        sa.Column("status", clearance_status, nullable=False, server_default="active"),
    )

    # --- user_work_stats ---
    op.create_table(
        "user_work_stats",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), unique=True),
        sa.Column("vacation_days_taken", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_vacation_days", sa.Integer(), nullable=False, server_default="28"),
        sa.Column("safety_violations", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tardiness_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("remarks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("employees_managed", sa.Integer(), nullable=True),
        sa.Column("shifts_this_month", sa.Integer(), nullable=True),
        sa.Column("reports_created", sa.Integer(), nullable=True),
    )

    # --- achievements ---
    op.create_table(
        "achievements",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("awarded_date", sa.Date(), nullable=True),
    )

    # --- otp_codes ---
    op.create_table(
        "otp_codes",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("phone", sa.String(), nullable=False, index=True),
        sa.Column("code_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- refresh_tokens ---
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False, index=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- categories ---
    op.create_table(
        "categories",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("short", sa.String(), nullable=True),
        sa.Column("color", sa.String(), nullable=True),
        sa.Column("bg_color", sa.String(), nullable=True),
        sa.Column("app_source", sa.String(), nullable=False, server_default="spektr"),
    )

    # --- questions ---
    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("category_id", sa.String(), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False, server_default="medium"),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("option_1", sa.String(), nullable=False),
        sa.Column("option_2", sa.String(), nullable=False),
        sa.Column("option_3", sa.String(), nullable=False),
        sa.Column("option_4", sa.String(), nullable=False),
        sa.Column("correct_index", sa.SmallInteger(), nullable=False),
        sa.Column("explanation", sa.String(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("app_source", sa.String(), nullable=False, server_default="spektr"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- test_sessions ---
    op.create_table(
        "test_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False, server_default="standard"),
        sa.Column("app_source", sa.String(), nullable=False, server_default="both"),
        sa.Column("time_limit_sec", sa.Integer(), nullable=False, server_default="1800"),
        sa.Column("pass_pct", sa.Integer(), nullable=False, server_default="70"),
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="3"),
        sa.Column("question_count", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("category_id", sa.String(), sa.ForeignKey("categories.id"), nullable=True),
        sa.Column("lesson_id", sa.Integer(), nullable=True),
        sa.Column("protocol_id", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- test_results ---
    op.create_table(
        "test_results",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("test_sessions.id"), nullable=True),
        sa.Column("test_type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("date_taken", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("pct", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("passed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("duration_sec", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("app_source", sa.String(), nullable=False, server_default="spektr"),
    )

    # --- test_result_answers ---
    op.create_table(
        "test_result_answers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("result_id", sa.Integer(), sa.ForeignKey("test_results.id"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id"), nullable=True),
        sa.Column("question_text", sa.String(), nullable=False),
        sa.Column("selected_index", sa.SmallInteger(), nullable=False),
        sa.Column("correct_index", sa.SmallInteger(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
    )

    # --- lessons ---
    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("category_id", sa.String(), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("video_url", sa.String(), nullable=True),
        sa.Column("duration_sec", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_label", sa.String(), nullable=True),
        sa.Column("views", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("has_test", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(), nullable=False, server_default="new"),
        sa.Column("publish_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- lesson_progress ---
    op.create_table(
        "lesson_progress",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False),
        sa.Column("watch_pct", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- courses ---
    op.create_table(
        "courses",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("direction", sa.String(), nullable=True),
        sa.Column("format", sa.String(), nullable=False, server_default="mixed"),
        sa.Column("duration_hours", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_label", sa.String(), nullable=True),
        sa.Column("price_label", sa.String(), nullable=True),
        sa.Column("next_start_date", sa.Date(), nullable=True),
        sa.Column("instructor", sa.String(), nullable=True),
        sa.Column("cover_emoji", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- course_program_items ---
    op.create_table(
        "course_program_items",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("course_id", sa.String(), sa.ForeignKey("courses.id"), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("item_text", sa.String(), nullable=False),
    )

    # --- documents ---
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("app_source", sa.String(), nullable=False, server_default="spektr"),
        sa.Column("lesson_id", sa.Integer(), nullable=True),
        sa.Column("section", sa.String(), nullable=True),
        sa.Column("profession", sa.String(), nullable=True),
        sa.Column("file_url", sa.String(), nullable=True),
        sa.Column("file_format", sa.String(), nullable=False, server_default="PDF"),
        sa.Column("file_size_label", sa.String(), nullable=True),
        sa.Column("pages", sa.Integer(), nullable=True),
        sa.Column("updated_at", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- document_reads ---
    op.create_table(
        "document_reads",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("document_id", sa.Integer(), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("read_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- protocols ---
    op.create_table(
        "protocols",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("short", sa.String(), nullable=True),
        sa.Column("icon", sa.String(), nullable=True),
        sa.Column("tone", sa.String(), nullable=False, server_default="warn"),
        sa.Column("status", sa.String(), nullable=False, server_default="todo"),
        sa.Column("updated_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- protocol_rules ---
    op.create_table(
        "protocol_rules",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("protocol_id", sa.String(), sa.ForeignKey("protocols.id"), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rule_text", sa.String(), nullable=False),
    )

    # --- mechanisms ---
    op.create_table(
        "mechanisms",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("profession", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(), nullable=False, server_default="todo"),
        sa.Column("dangers", sa.String(), nullable=True),
        sa.Column("precautions", sa.String(), nullable=True),
        sa.Column("failure_scenarios", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- mechanism_steps ---
    op.create_table(
        "mechanism_steps",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("mechanism_id", sa.String(), sa.ForeignKey("mechanisms.id"), nullable=False),
        sa.Column("order_num", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("step_text", sa.String(), nullable=False),
    )

    # --- mood_entries ---
    op.create_table(
        "mood_entries",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("mood", sa.SmallInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "date", name="uq_mood_user_date"),
    )

    # --- notifications ---
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- training_materials ---
    op.create_table(
        "training_materials",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False, server_default="course"),
        sa.Column("duration_label", sa.String(), nullable=True),
        sa.Column("thumbnail_url", sa.String(), nullable=True),
        sa.Column("total_lessons", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- training_progress ---
    op.create_table(
        "training_progress",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("material_id", sa.Integer(), sa.ForeignKey("training_materials.id"), nullable=False),
        sa.Column("completed_lessons", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress_pct", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- events ---
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("tone", sa.String(), nullable=False, server_default="info"),
        sa.Column("ip_address", sa.String(), nullable=True),
        sa.Column("app_source", sa.String(), nullable=False, server_default="spektr"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # --- system_settings ---
    op.create_table(
        "system_settings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("key", sa.String(), unique=True, nullable=False),
        sa.Column("value", sa.String(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("system_settings")
    op.drop_table("events")
    op.drop_table("training_progress")
    op.drop_table("training_materials")
    op.drop_table("notifications")
    op.drop_table("mood_entries")
    op.drop_table("mechanism_steps")
    op.drop_table("mechanisms")
    op.drop_table("protocol_rules")
    op.drop_table("protocols")
    op.drop_table("document_reads")
    op.drop_table("documents")
    op.drop_table("course_program_items")
    op.drop_table("courses")
    op.drop_table("lesson_progress")
    op.drop_table("lessons")
    op.drop_table("test_result_answers")
    op.drop_table("test_results")
    op.drop_table("test_sessions")
    op.drop_table("questions")
    op.drop_table("categories")
    op.drop_table("refresh_tokens")
    op.drop_table("otp_codes")
    op.drop_table("achievements")
    op.drop_table("user_work_stats")
    op.drop_table("medical_clearances")
    op.drop_table("user_medical_info")
    op.drop_table("subordinates")
    op.drop_table("users")

    # Drop enums (PostgreSQL only)
    sa.Enum(name="clearance_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_state").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="app_source").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
