# Sample data
from database import SessionLocal
from models import Product


session = SessionLocal()

class InventoryService:
    def __init__(self):
        # Preload sample data
        self.session = session
        
  
    
    def get_items(self):
        products = self.session.query(Product).all()
        return [{
            'id':p.id,
            'name':p.name,
            'category':p.category,
            'quantity':p.quantity,
            'unit':p.unit,
            'expirationDate':p.expirationDate,
            'supplier':p.supplier,
            'price':p.price,
            'sku':p.sku,
            'reorderLevel':p.reorderLevel,
            'batchNumber':p.batchNumber
        } for p in products]

    def get_item(self, item_id):

        product = self.session.query(Product).filter(Product.id == item_id).first()

        if product is None:
            return None


        return {
            'id':product.id,
            'name':product.name,
            'category':product.category,
            'quantity':product.quantity,
            'unit':product.unit,
            'expirationDate':product.expirationDate,
            'supplier':product.supplier,
            'price':product.price,
            'sku':product.sku,
            'reorderLevel':product.reorderLevel,
            'batchNumber':product.batchNumber
        }
    
    def update_item(self,item_id,data):
        product = self.session.query(Product).filter(Product.id == item_id).first()

        if product is None:
            return {"message":"item not found"}

        for key,value in data.items():
            if hasattr(product,key):
                setattr(product,key,value)

        self.session.commit()

        return {
            "message":"item updated",
            "item":{
                'id':product.id,
                'name':product.name,
                'category':product.category,
                'quantity':product.quantity,
                'unit':product.unit,
                'expirationDate':product.expirationDate,
                'supplier':product.supplier,
                'price':product.price,
                'sku':product.sku,
                'reorderLevel':product.reorderLevel,
                'batchNumber':product.batchNumber
            }
        }
    
    def delete_item(self, item_id):
        exists = any(i['id'] == item_id for i in self.inventory)
        self.inventory = [i for i in self.inventory if i['id'] != item_id]
        return {'message': 'Item deleted'} if exists else {'message': 'Item not found'}
