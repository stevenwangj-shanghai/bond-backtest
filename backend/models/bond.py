from pydantic import BaseModel
from typing import Optional

class Bond(BaseModel):
    bond_code: str
    bond_name: str
    stock_code: str
    stock_name: str
    price: float
    convert_value: float
    premium_rate: float
    yield_to_maturity: float
    remaining_years: float
    rating: str

class BondFilter(BaseModel):
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    max_premium_rate: Optional[float] = None
