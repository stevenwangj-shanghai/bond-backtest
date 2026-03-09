import json
from typing import List, Optional
from models.bond import Bond

class BondService:
    def __init__(self):
        self.bonds = self._load_bonds()
    
    def _load_bonds(self) -> List[Bond]:
        with open('data/bonds.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return [Bond(**item) for item in data]
    
    def get_all_bonds(self) -> List[Bond]:
        return self.bonds
    
    def filter_bonds(self, min_price: Optional[float] = None, 
                     max_price: Optional[float] = None,
                     max_premium_rate: Optional[float] = None) -> List[Bond]:
        result = self.bonds
        
        if min_price is not None:
            result = [b for b in result if b.price >= min_price]
        
        if max_price is not None:
            result = [b for b in result if b.price <= max_price]
        
        if max_premium_rate is not None:
            result = [b for b in result if b.premium_rate <= max_premium_rate]
        
        return result
    
    def get_bond_by_code(self, bond_code: str) -> Optional[Bond]:
        for bond in self.bonds:
            if bond.bond_code == bond_code:
                return bond
        return None
