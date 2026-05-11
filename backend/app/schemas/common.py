from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


class MessageResponse(BaseModel):
    message: str


class IDResponse(BaseModel):
    id: int | str
