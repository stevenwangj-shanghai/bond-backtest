from fastapi import APIRouter, Query
from typing import List, Optional
from models.bond import Bond
from services.bond_service import BondService

router = APIRouter()
bond_service = BondService()

@router.get("/bonds", response_model=List[Bond])
async def get_bonds():
    """获取所有可转债"""
    return bond_service.get_all_bonds()

@router.get("/bonds/filter", response_model=List[Bond])
async def filter_bonds(
    min_price: Optional[float] = Query(None, description="最低价格"),
    max_price: Optional[float] = Query(None, description="最高价格"),
    max_premium_rate: Optional[float] = Query(None, description="最大溢价率")
):
    """按条件筛选可转债"""
    return bond_service.filter_bonds(min_price, max_price, max_premium_rate)

@router.get("/bonds/{bond_code}", response_model=Bond)
async def get_bond(bond_code: str):
    """获取单只可转债详情"""
    bond = bond_service.get_bond_by_code(bond_code)
    if bond is None:
        raise HTTPException(status_code=404, detail="可转债不存在")
    return bond
