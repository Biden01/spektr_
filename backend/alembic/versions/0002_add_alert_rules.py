"""add alert_rules table

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-09
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "alert_rules",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("trigger", sa.String(), nullable=False, server_default="overdue"),
        sa.Column("recipient", sa.String(), nullable=False, server_default="employee"),
        sa.Column("channel", sa.String(), nullable=False, server_default="push"),
        sa.Column("active", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Seed default rules
    op.execute("""
        INSERT INTO alert_rules (title, trigger, recipient, channel, active) VALUES
        ('Уведомить мастера при провале ежедневной проверки 2 раза подряд', 'fail_streak', 'master', 'email_push', true),
        ('Уведомить за 14 дней до ежегодной проверки', 'before_annual', 'employee', 'push', true),
        ('Уведомить за 7 дней до окончания медосмотра', 'before_medical', 'employee_master', 'email', true),
        ('Уведомить администратора о просрочках > 3 дней', 'overdue_3d', 'admin', 'email', true),
        ('Еженедельный отчёт по участку', 'weekly_report', 'master', 'email', false)
    """)


def downgrade() -> None:
    op.drop_table("alert_rules")
