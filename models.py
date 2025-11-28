from sqlalchemy import Column,String,Integer,Float
from database import Base,engine


class Product(Base):
    __tablename__ = 'products'

    id = Column(String,primary_key=True)
    name = Column(String)
    category = Column(String)
    quantity = Column(Integer)
    unit = Column(String)
    expirationDate = Column(String)
    supplier = Column(String)
    price = Column(Float)
    sku = Column(String)
    reorderLevel = Column(Integer)
    batchNumber = Column(String)

Base.metadata.create_all(engine)