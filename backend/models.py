from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship

class Warehouse(SQLModel, table = True):
    __tablename__ = "warehouses"
    id: str = Field(primary_key=True)
    name: str

class Product(SQLModel, table = True):
    __tablename__ = "products"
    id: str = Field(primary_key=True)
    name: str

class ReportType(SQLModel, table = True):
    __tablename__ = "report_types"
    id: str = Field(primary_key=True)
    name: str

class Report(SQLModel, table=True):
    __tablename__ = "reports"

    id: str = Field(primary_key=True)
    
    # 4. The Link Icon 🔗 means Foreign Key. 
    # It must match the Primary Key of the target table exactly.
    warehouse: str = Field(foreign_key="warehouses.id")
    type: str = Field(foreign_key="report_types.id")
    
    # Regular columns
    date: str 
    note: Optional[str] = None # No "NN" on your image implies Optional

class ResportItem(SQLModel, table=True):
    __tablename__ = "report_items"
    report: str = Field(foreign_key="reports.id")
    products: str = Field(foreign_key="products.id")
    on_shelf: int