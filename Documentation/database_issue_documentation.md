# Database Issue Documentation: Missing Product Table

## Problem Statement

The `products` table is not visible in `inventory.db` because **the database tables have never been created**. While the SQLAlchemy models are defined, there is no code that actually creates the tables in the database.

---

## Root Cause Analysis

### 1. **Missing Table Creation Code**

Your application defines the database schema in [models.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py) but **never executes the table creation command**.

#### What You Have:
- ✅ Database engine configuration in [database.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/database.py)
- ✅ Product model defined with `Base` in [models.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py)
- ✅ Flask app setup in [app.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/app.py)

#### What's Missing:
- ❌ **No call to `Base.metadata.create_all(engine)`** anywhere in the codebase

This is the critical missing piece. SQLAlchemy requires you to explicitly create tables using this command.

---

### 2. **Additional Issues in Your Code**

While investigating, I found several other problems:

#### A. Incomplete Model Definition ([models.py:16](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py#L16))
```python
sku = Column  # ❌ Incomplete - missing column type and parentheses
```
**Should be:**
```python
sku = Column(String)  # ✅ Complete column definition
```

#### B. Incorrect Service Attribute ([inventory_service.py:9](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/services/inventory_service.py#L9))
```python
def __init__(self):
    # Preload sample data
    self.inventory = SessionLocal()  # ❌ This creates a session, not an inventory list
```
**Issue:** On line 9, you assign a database session to `self.inventory`, but then on lines 12, 19, 22-30, you treat it like a list with `.append()`, list comprehensions, and iteration.

#### C. Attribute Name Mismatch ([inventory_service.py:16](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/services/inventory_service.py#L16))
```python
def get_items(self):
    return self.session.query(Product).all()  # ❌ No self.session defined
```
**Issue:** Line 9 defines `self.inventory`, but line 16 tries to use `self.session`.

---

## How SQLAlchemy Table Creation Works

### The Proper Flow:
1. **Define Base** (declarative_base) → ✅ You have this in [database.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/database.py)
2. **Define Models** (inheriting from Base) → ✅ You have this in [models.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py)
3. **Call `Base.metadata.create_all(engine)`** → ❌ **This is missing!**

When you call `Base.metadata.create_all(engine)`, SQLAlchemy:
- Inspects all classes that inherit from `Base`
- Generates `CREATE TABLE` SQL statements
- Executes them against the database

**Without this step, the database file exists but contains no tables.**

---

## Solution Overview

You need to add database initialization code. There are two common approaches:

### Option 1: Initialize on App Startup (Recommended)
Add the table creation code to [app.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/app.py) so tables are created when the Flask app starts.

### Option 2: Separate Initialization Script
Create a dedicated script (e.g., `init_db.py`) that you run once to set up the database.

---

## Recommended Fix

### Step 1: Fix the Product Model

**File:** [models.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py)

Change line 16:
```diff
- sku = Column
+ sku = Column(String)
```

### Step 2: Add Database Initialization to app.py

**File:** [app.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/app.py)

```python
from flask import Flask
from api.inventory_routes import inventory_bp
from flask_cors import CORS
from database import engine, Base  # Add this import
from models import Product  # Add this import

def create_app():
    app = Flask(__name__)

    # Enable CORS (critical for React frontend)
    CORS(app)

    # Create all database tables
    with app.app_context():
        Base.metadata.create_all(bind=engine)

    # Register your blueprint
    app.register_blueprint(inventory_bp, url_prefix='/api/items')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
```

### Step 3: Fix the Inventory Service

**File:** [inventory_service.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/services/inventory_service.py)

The service mixes database operations with list operations. Here's a corrected version:

```python
from database import SessionLocal
from models import Product


class InventoryService:
    def __init__(self):
        # Create a database session
        self.session = SessionLocal()
        
    def add_item(self, data):
        # Create a new Product instance
        product = Product(**data)
        self.session.add(product)
        self.session.commit()
        return {'message': 'Item added', 'item': data}
    
    def get_items(self):
        return self.session.query(Product).all()
    
    def get_item(self, item_id):
        return self.session.query(Product).filter(Product.id == item_id).first()
    
    def update_item(self, item_id, data):
        product = self.session.query(Product).filter(Product.id == item_id).first()
        if product:
            for key, value in data.items():
                setattr(product, key, value)
            self.session.commit()
            return {'message': 'Item updated', 'item': data}
        return {'message': 'Item not found'}
    
    def delete_item(self, item_id):
        product = self.session.query(Product).filter(Product.id == item_id).first()
        if product:
            self.session.delete(product)
            self.session.commit()
            return {'message': 'Item deleted'}
        return {'message': 'Item not found'}
```

---

## Verification Steps

After applying the fixes:

1. **Stop your Flask server** if it's running
2. **Delete the old database** (optional but recommended):
   ```bash
   rm inventory.db
   ```
3. **Run the Flask app**:
   ```bash
   python app.py
   ```
4. **Check the database** using SQLite CLI:
   ```bash
   sqlite3 inventory.db
   .tables
   .schema products
   ```

You should now see the `products` table!

---

## Summary

| Issue | Location | Severity |
|-------|----------|----------|
| No table creation code | [app.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/app.py) | 🔴 **Critical** - Tables never created |
| Incomplete column definition | [models.py:16](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py#L16) | 🟡 **High** - Will cause errors |
| Wrong service implementation | [inventory_service.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/services/inventory_service.py) | 🟡 **High** - Won't work with database |

> [!IMPORTANT]
> The primary reason you can't see the product table is that **`Base.metadata.create_all(engine)` is never called**. Without this, SQLAlchemy never executes the `CREATE TABLE` SQL statements.
