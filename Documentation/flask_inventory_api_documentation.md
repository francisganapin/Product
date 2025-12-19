# Flask Inventory Management API Documentation

## Overview
This Flask application provides an API for managing inventory items. It includes endpoints for CRUD operations and additional functionality like fetching items that are expiring soon. The application is designed to work with a database and supports integration with a React frontend through CORS.

---

## Project Structure
```
Inventory/
├── api/
│   └── inventory_routes.py  # Contains API route definitions
├── services/
│   └── inventory_service.py # Contains business logic for inventory management
├── models.py                # Defines database models
├── database.py              # Database connection setup
├── app.py                   # Main application entry point
```

---

## [`app.py`](app.py )

### Purpose
The [`app.py`](app.py ) file is the entry point for the Flask application. It initializes the app, sets up the database, enables CORS, and registers the API blueprint.

### Code Breakdown
```python
from flask import Flask
from api.inventory_routes import inventory_bp
from flask_cors import CORS  # Add this import
from models import engine, Base, Product
```
- **Imports**:
  - [`Flask`](/c:/Users/francis/AppData/Local/Programs/Python/Python312/Lib/site-packages/flask/app.py ): Core Flask framework.
  - [`inventory_bp`](api/inventory_routes.py ): Blueprint containing API routes.
  - [`CORS`](/c:/Users/francis/AppData/Local/Programs/Python/Python312/Lib/site-packages/flask_cors/extension.py ): Enables Cross-Origin Resource Sharing for frontend integration.
  - [`engine`](database.py ), [`Base`](database.py ), [`Product`](models.py ): Database engine and models.

---

### [`create_app()`](app.py ) Function
```python
def create_app():
    app = Flask(__name__)

    # Enable CORS (critical for React frontend)
    CORS(app)

    with app.app_context():
        Base.metadata.create_all(bind=engine)

    # Register your blueprint
    app.register_blueprint(inventory_bp, url_prefix='/api/items')

    return app
```

- **CORS**:
  - Enables cross-origin requests, allowing the React frontend to communicate with the Flask backend.

- **Database Initialization**:
  - [`Base.metadata.create_all(bind=engine)`](database.py ) ensures that all database tables are created if they don't already exist.

- **Blueprint Registration**:
  - The [`inventory_bp`](api/inventory_routes.py ) blueprint is registered with the URL prefix [`/api/items`](api/__init__.py ).

---

### Running the Application
```python
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
```
- **Debug Mode**:
  - The app runs in debug mode, which provides detailed error messages and auto-reloads the server during development.

---

## [`inventory_routes.py`](api/inventory_routes.py )

### Purpose
Defines the API endpoints for managing inventory items. It uses the `InventoryService` class to interact with the database.

### Endpoints

#### 1. **Add Item**
```http
POST /api/items
```
- **Description**: Adds a new item to the inventory.
- **Request Body**:
  ```json
  {
    "id": "FS001",
    "name": "Calcium + Vitamin D",
    "category": "Bone Support",
    "quantity": 180,
    "unit": "bottle",
    "expirationDate": "2024-04-20",
    "supplier": "StrongBones Pharma",
    "price": 9.99,
    "sku": "CVD-04",
    "reorderLevel": 60,
    "batchNumber": "BATCH2025-04"
  }
  ```
- **Response**:
  - `201 Created` on success.

---

#### 2. **Get All Items**
```http
GET /api/items
```
- **Description**: Retrieves all items in the inventory.
- **Response**:
  ```json
  [
    {
      "id": "FS001",
      "name": "Calcium + Vitamin D",
      "category": "Bone Support",
      "quantity": 180,
      "unit": "bottle",
      "expirationDate": "2024-04-20",
      "supplier": "StrongBones Pharma",
      "price": 9.99,
      "sku": "CVD-04",
      "reorderLevel": 60,
      "batchNumber": "BATCH2025-04"
    }
  ]
  ```

---

#### 3. **Get Single Item**
```http
GET /api/items/<item_id>
```
- **Description**: Retrieves a single item by its ID.
- **Response**:
  - `200 OK` with item details.
  - `404 Not Found` if the item does not exist.

---

#### 4. **Update Item**
```http
PUT /api/items/<item_id>
```
- **Description**: Updates an existing item.
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "quantity": 200
  }
  ```
- **Response**:
  - `200 OK` on success.
  - `404 Not Found` if the item does not exist.

---

#### 5. **Delete Item**
```http
DELETE /api/items/<item_id>
```
- **Description**: Deletes an item by its ID.
- **Response**:
  - `200 OK` on success.
  - `404 Not Found` if the item does not exist.

---

#### 6. **Get Expiring Soon Items**
```http
GET /api/items/expiring_items
```
- **Description**: Retrieves items that are expiring within the next 90 days.
- **Response**:
  ```json
  [
    {
      "id": "FS001",
      "name": "Calcium + Vitamin D",
      "expirationDate": "2024-04-20"
    }
  ]
  ```

---

## `inventory_service.py`

### Purpose
Contains the `InventoryService` class, which provides methods for interacting with the database.

### Methods

1. **`get_items()`**:
   - Fetches all items from the database.
   - Returns a list of dictionaries representing the items.

2. **`get_item(item_id)`**:
   - Fetches a single item by its ID.
   - Returns a dictionary representing the item or `None` if not found.

3. **`update_item(item_id, data)`**:
   - Updates an item's attributes based on the provided data.
   - Commits the changes to the database.

4. **`delete_item(item_id)`**:
   - Deletes an item by its ID.
   - Rolls back the transaction if an error occurs.

---

## [`models.py`](models.py )

### Purpose
Defines the [`Product`](models.py ) model, which represents the inventory items in the database.

### Example Model
```python
from sqlalchemy import Column, String, Integer, Float, Date
from database import Base

class Product(Base):
    __tablename__ = 'products'

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit = Column(String, nullable=False)
    expirationDate = Column(Date, nullable=False)
    supplier = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    sku = Column(String, nullable=False)
    reorderLevel = Column(Integer, nullable=False)
    batchNumber = Column(String, nullable=False)
```

---

## [`database.py`](database.py )

### Purpose
Sets up the database connection using SQLAlchemy.

### Example Code
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./inventory.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

---

## Running the Application

1. **Install Dependencies**:
   ```bash
   pip install flask flask-cors sqlalchemy
   ```

2. **Run the Flask App**:
   ```bash
   python app.py
   ```

3. **Access the API**:
   - Base URL: `http://127.0.0.1:5000/api/items`

4. **Test with Postman**:
   - Use Postman to test the endpoints.

---

## Notes

- **CORS**: Enabled for frontend integration.
- **Database**: Uses SQLite by default. Update `DATABASE_URL` in [`database.py`](database.py ) for other databases.
- **Debugging**: Use `print` statements or Flask's debug mode for troubleshooting.

--- 

This documentation should help you review and understand your Flask application!