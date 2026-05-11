from sqlalchemy import Column, String
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    short = Column(String, nullable=True)
    color = Column(String, nullable=True)
    bg_color = Column(String, nullable=True)
    app_source = Column(String, default="spektr")
