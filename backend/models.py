from typing import Optional, List
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship

class UpfitAccount(BaseModel):
    username: str = Field(..., min_length=1, description="Username for Upfit account")
    password: str = Field(..., min_length=1, description="Password for Upfit account")


class SessionResponse(BaseModel):
    PHPSESSID: str
    clubName: str
    clubId: str


class ErrorResponse(BaseModel):
    detail: str
    error_code: str

###           DataBase Models           ### 

class Club(SQLModel, table=True):
    __tablename__ = "clubs"
    id: str = Field(primary_key=True)
    name: str
    items: List["ClubItem"] = Relationship(back_populates="club_link")

class Product(SQLModel, table=True):
    __tablename__ = "products"
    id: str = Field(primary_key=True)
    name: str
    price: Optional[int]

class ReportType(SQLModel, table=True):
    __tablename__ = "report_types"
    id: str = Field(primary_key=True)
    name: str

class Report(SQLModel, table=True):
    __tablename__ = "reports"
    id: str = Field(primary_key=True)
    club_id: str = Field(foreign_key="clubs.id")
    type_id: str = Field(foreign_key="report_types.id")
    date: str 
    note: Optional[str] = None

    items: List["ReportItem"] = Relationship(back_populates="report_link")

class ReportItem(SQLModel, table=True):
    __tablename__ = "report_items"
    report_id: str = Field(foreign_key="reports.id", primary_key=True)
    product_id: str = Field(foreign_key="products.id", primary_key=True)
    
    on_shelf: int
    in_club: int

    report_link: "Report" = Relationship(back_populates="items")
    product_link: "Product" = Relationship()

class ClubItem(SQLModel, table=True):
    __tablename__ = "club_items"

    club_id: str = Field(foreign_key="clubs.id", primary_key=True)
    product_id: str = Field(foreign_key="products.id", primary_key=True)
    
    quantity: str

    club_link: "Club" = Relationship(back_populates="items")
    product_link: "Product" = Relationship()