from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=True)
    app_source = Column(String, default="spektr")
    lesson_id = Column(Integer, nullable=True)
    section = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    file_format = Column(String, default="PDF")
    file_size_label = Column(String, nullable=True)
    pages = Column(Integer, nullable=True)
    updated_at = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    reads = relationship("DocumentRead", back_populates="document", cascade="all, delete-orphan")


class DocumentRead(Base):
    __tablename__ = "document_reads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    read_at = Column(DateTime, server_default=func.now())

    document = relationship("Document", back_populates="reads")
