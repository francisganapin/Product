# Update Item Method Documentation

## Overview
This document explains how the `update_item` method in `inventory_service.py` works and how it integrates with the `EditProductModal.tsx` component.

---

## **⚠️ CRITICAL BUG DETECTED**

The `update_item` method in `inventory_service.py` currently has a **major bug** that prevents it from working:

### Current Broken Code (Lines 53-58)
```python
def update_item(self, item_id, data):
    for item in self.inventory:  # ❌ BUG: self.inventory doesn't exist!
        if item['id'] == item_id:
            item.update(data)
            return {'message': 'Item updated', 'item': item}
    return {'message': 'Item not found'}
```

### The Problem
- The method tries to iterate over `self.inventory`, but **this attribute doesn't exist**
- The class uses `self.session` (database session) instead of in-memory `self.inventory`
- This will cause an `AttributeError` when called

### How It Should Work (Corrected Version)
```python
def update_item(self, item_id, data):
    # Query the database for the product with the given ID
    product = self.session.query(Product).filter(Product.id == item_id).first()
    
    # If product not found, return error
    if product is None:
        return {'message': 'Item not found'}
    
    # Update the product fields with new data
    for key, value in data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    
    # Commit changes to database
    self.session.commit()
    
    # Return success message with updated product
    return {
        'message': 'Item updated',
        'item': {
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'quantity': product.quantity,
            'unit': product.unit,
            'expirationDate': product.expirationDate,
            'supplier': product.supplier,
            'price': product.price,
            'sku': product.sku,
            'reorderLevel': product.reorderLevel,
            'batchNumber': product.batchNumber
        }
    }
```

---

## How the Full Update Flow Works

### 1. **Frontend: EditProductModal Component**

When a user clicks "Update Product" in [EditProductModal.tsx](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/components/EditProductModal.tsx):

#### Step 1: Form Submission (Lines 38-63)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Create updated product object from form data
    const updatedProduct = {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        reorderLevel: Number(formData.reorderLevel),
        expirationDate: formData.expirationDate,
        batchNumber: formData.batchNumber,
        supplier: formData.supplier,
        price: Number(formData.price),
        sku: formData.sku
    };
    
    // Update local UI immediately (optimistic update)
    onUpdate(updatedProduct);
    
    // Send update to backend API
    await fetch(`http://localhost:5000/api/items/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct)
    });
    
    // Close the modal
    onClose();
};
```

### 2. **Backend: Flask API Route**

The frontend sends a `PUT` request to `/api/items/{id}`, which should be handled by a Flask route (typically in `inventory_routes.py`):

```python
@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_product(item_id):
    data = request.get_json()
    result = inventory_service.update_item(item_id, data)
    return jsonify(result)
```

### 3. **Backend: InventoryService.update_item Method**

The `update_item` method should:

1. **Query the database** for the product with matching `item_id`
2. **Check if product exists** - if not, return error
3. **Update product fields** with the new data
4. **Commit changes** to the database
5. **Return success response** with updated product data

---

## Data Flow Diagram

```
User Edits Form
      ↓
Click "Update Product"
      ↓
handleSubmit() triggered
      ↓
Create updatedProduct object
      ↓
onUpdate(updatedProduct)  ← Updates UI immediately
      ↓
fetch() PUT request to /api/items/{id}
      ↓
Flask Route receives request
      ↓
inventory_service.update_item(id, data)
      ↓
Query database for product
      ↓
Update product fields
      ↓
Commit to database
      ↓
Return success response
      ↓
Modal closes
```

---

## Example Usage

### Frontend Call (Automatic)
When the user fills out the form and clicks "Update Product":

```typescript
// Example form data
{
    name: "Vitamin C 1000mg",
    category: "Vitamins",
    quantity: 150,
    unit: "bottles",
    reorderLevel: 30,
    expirationDate: "2025-12-31",
    batchNumber: "VC2024-001",
    supplier: "Health Plus Inc.",
    price: 24.99,
    sku: "VIT-C-1000"
}
```

### Backend Processing
```python
# item_id = 5 (from URL parameter)
# data = {form data above}

result = inventory_service.update_item(5, data)

# Expected return:
{
    'message': 'Item updated',
    'item': {
        'id': 5,
        'name': 'Vitamin C 1000mg',
        'category': 'Vitamins',
        # ... all other fields
    }
}
```

---

## Key Points

### ✅ What Works
1. **Form State Management** - Uses React `useState` to track form inputs
2. **Data Validation** - Required fields, number validation, date inputs
3. **Optimistic Updates** - UI updates immediately via `onUpdate()` callback
4. **API Integration** - Sends PUT request to Flask backend

### ❌ What's Broken
1. **Backend Method** - `update_item` references non-existent `self.inventory`
2. **No Database Persistence** - Changes won't save to PostgreSQL database
3. **No Error Handling** - Frontend doesn't check if API call succeeded

### 🔧 What Needs Fixing
1. Rewrite `update_item` to use `self.session.query(Product)` instead of `self.inventory`
2. Add database commit: `self.session.commit()`
3. Add error handling in frontend `handleSubmit`
4. Add response validation to ensure update succeeded

---

## Related Files

- [EditProductModal.tsx](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/components/EditProductModal.tsx#L38-L63) - Frontend modal component
- [inventory_service.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/services/inventory_service.py#L53-L58) - Backend service (BUGGY)
- `inventory_routes.py` - Flask API routes (not shown)
- [models.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/models.py) - Database models

---

## Recommendations

> [!CAUTION]
> The `update_item` method will crash when called! Fix this immediately to enable product editing.

> [!IMPORTANT]
> The frontend performs an "optimistic update" - it updates the UI before confirming the backend succeeded. If the backend fails, the UI will show incorrect data.

> [!TIP]
> Add error handling in `handleSubmit` to catch failed API calls and revert the UI update if needed.
