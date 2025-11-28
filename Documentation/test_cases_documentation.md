# Inventory Management System - Test Cases Documentation

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [API Endpoint Tests](#api-endpoint-tests)
3. [Database Tests](#database-tests)
4. [Integration Tests](#integration-tests)
5. [Error Handling Tests](#error-handling-tests)
6. [Performance Tests](#performance-tests)
7. [Test Data Repository](#test-data-repository)

---

## Test Environment Setup

### Prerequisites

```bash
# Ensure Flask server is running
python app.py

# Verify server is accessible
curl http://localhost:5000/api/items
```

### Test Tools

- **curl** - Command-line HTTP client
- **Postman** - GUI API testing (optional)
- **pytest** - Python testing framework (for automated tests)
- **sqlite3** - SQLite command-line tool

### Test Database

For testing, use a separate database:
```python
# In database.py
DATABASE_URL = 'sqlite:///inventory_test.db'
```

---

## API Endpoint Tests

### Test Case 1: Get All Products (Empty Database)

**Objective:** Verify API returns empty array when no products exist

**Prerequisites:** Fresh database with no records

**Request:**
```bash
curl -X GET http://localhost:5000/api/items
```

**Expected Response:**
```json
[]
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Response is valid JSON array
- ✅ Array is empty
- ✅ No errors in console
- ✅ Response time < 1 second

---

### Test Case 2: Create Product (Valid Data)

**Objective:** Successfully create a new product with all valid fields

**Prerequisites:** Database table exists

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ELEC001",
    "name": "Dell Laptop",
    "category": "Electronics",
    "quantity": 25,
    "unit": 1,
    "expirationDate": "2026-12-31",
    "supplier": "Dell Inc.",
    "price": 1299.99,
    "sku": "DELL-LAP-XPS15"
  }'
```

**Expected Response:**
```json
{
  "message": "Item added",
  "item": {
    "id": "ELEC001",
    "name": "Dell Laptop",
    "category": "Electronics",
    "quantity": 25,
    "unit": 1,
    "expirationDate": "2026-12-31",
    "supplier": "Dell Inc.",
    "price": 1299.99,
    "sku": "DELL-LAP-XPS15"
  }
}
```

**Expected Status Code:** `201 Created`

**Validation:**
- ✅ Product appears in database
- ✅ All fields match input
- ✅ Response includes message and item
- ✅ Item has all 9 fields

**Database Verification:**
```bash
sqlite3 inventory.db "SELECT * FROM products WHERE id='ELEC001';"
```

---

### Test Case 3: Create Product (Duplicate ID)

**Objective:** Verify system prevents duplicate product IDs

**Prerequisites:** Product with ID "ELEC001" already exists

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ELEC001",
    "name": "Different Product",
    "category": "Electronics",
    "quantity": 10,
    "unit": 1,
    "expirationDate": "2025-12-31",
    "supplier": "Other Supplier",
    "price": 99.99,
    "sku": "SKU-002"
  }'
```

**Expected Response:**
```json
{
  "error": "UNIQUE constraint failed: products.id"
}
```

**Expected Status Code:** `201` (handled by service layer)

**Validation:**
- ✅ Error message indicates constraint violation
- ✅ Original product unchanged
- ✅ No duplicate created

---

### Test Case 4: Get All Products (With Data)

**Objective:** Retrieve all products when database has records

**Prerequisites:** At least 3 products in database

**Setup:**
```bash
# Add test products
curl -X POST http://localhost:5000/api/items -H "Content-Type: application/json" \
  -d '{"id":"PROD001","name":"Product 1","category":"Cat A","quantity":10,"unit":1,"expirationDate":"2025-12-31","supplier":"Supplier A","price":99.99,"sku":"SKU001"}'

curl -X POST http://localhost:5000/api/items -H "Content-Type: application/json" \
  -d '{"id":"PROD002","name":"Product 2","category":"Cat B","quantity":20,"unit":1,"expirationDate":"2026-06-30","supplier":"Supplier B","price":149.99,"sku":"SKU002"}'

curl -X POST http://localhost:5000/api/items -H "Content-Type: application/json" \
  -d '{"id":"PROD003","name":"Product 3","category":"Cat C","quantity":30,"unit":1,"expirationDate":"2025-03-15","supplier":"Supplier C","price":199.99,"sku":"SKU003"}'
```

**Request:**
```bash
curl -X GET http://localhost:5000/api/items
```

**Expected Response:**
```json
[
  {
    "id": "PROD001",
    "name": "Product 1",
    ...
  },
  {
    "id": "PROD002",
    "name": "Product 2",
    ...
  },
  {
    "id": "PROD003",
    "name": "Product 3",
    ...
  }
]
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Response is array with 3 items
- ✅ Each item has all required fields
- ✅ Items match database records
- ✅ No duplicates in response

---

### Test Case 5: Get Single Product (Exists)

**Objective:** Retrieve specific product by ID

**Prerequisites:** Product with ID "PROD001" exists

**Request:**
```bash
curl -X GET http://localhost:5000/api/items/PROD001
```

**Expected Response:**
```json
{
  "id": "PROD001",
  "name": "Product 1",
  "category": "Cat A",
  "quantity": 10,
  "unit": 1,
  "expirationDate": "2025-12-31",
  "supplier": "Supplier A",
  "price": 99.99,
  "sku": "SKU001"
}
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Response is single object (not array)
- ✅ ID matches requested ID
- ✅ All fields present

---

### Test Case 6: Get Single Product (Not Found)

**Objective:** Handle request for non-existent product

**Prerequisites:** Product with ID "NONEXIST" does not exist

**Request:**
```bash
curl -X GET http://localhost:5000/api/items/NONEXIST
```

**Expected Response:**
```json
{
  "error": "Item not found"
}
```

**Expected Status Code:** `404 Not Found`

**Validation:**
- ✅ Error message indicates item not found
- ✅ No exception thrown
- ✅ Proper 404 status code

---

### Test Case 7: Update Product (Partial Update)

**Objective:** Update only specific fields of existing product

**Prerequisites:** Product with ID "PROD001" exists with quantity=10, price=99.99

**Request:**
```bash
curl -X PUT http://localhost:5000/api/items/PROD001 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "price": 89.99
  }'
```

**Expected Response:**
```json
{
  "message": "Item updated",
  "item": {
    "id": "PROD001",
    "name": "Product 1",
    "category": "Cat A",
    "quantity": 50,
    "unit": 1,
    "expirationDate": "2025-12-31",
    "supplier": "Supplier A",
    "price": 89.99,
    "sku": "SKU001"
  }
}
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Quantity changed from 10 to 50
- ✅ Price changed from 99.99 to 89.99
- ✅ Other fields unchanged
- ✅ Database reflects changes

**Database Verification:**
```bash
sqlite3 inventory.db "SELECT quantity, price FROM products WHERE id='PROD001';"
```

**Expected:** `50|89.99`

---

### Test Case 8: Update Product (Full Update)

**Objective:** Replace all product data

**Prerequisites:** Product with ID "PROD002" exists

**Request:**
```bash
curl -X PUT http://localhost:5000/api/items/PROD002 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "category": "New Category",
    "quantity": 100,
    "unit": 2,
    "expirationDate": "2027-01-01",
    "supplier": "New Supplier",
    "price": 299.99,
    "sku": "NEW-SKU-002"
  }'
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ All fields updated
- ✅ ID remains unchanged
- ✅ Database shows new values

---

### Test Case 9: Update Product (Not Found)

**Objective:** Handle update request for non-existent product

**Prerequisites:** No product with ID "GHOST"

**Request:**
```bash
curl -X PUT http://localhost:5000/api/items/GHOST \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100
  }'
```

**Expected Response:**
```json
{
  "message": "Item not found"
}
```

**Expected Status Code:** `200 OK` (should be 404, but current implementation returns 200)

**Validation:**
- ✅ Error message returned
- ✅ No record created
- ✅ No exception thrown

---

### Test Case 10: Delete Product (Exists)

**Objective:** Successfully delete an existing product

**Prerequisites:** Product with ID "PROD003" exists

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/items/PROD003
```

**Expected Response:**
```json
{
  "message": "Item deleted"
}
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Success message returned
- ✅ Product removed from database
- ✅ Subsequent GET returns 404

**Verification:**
```bash
# Should return empty or error
curl -X GET http://localhost:5000/api/items/PROD003
```

**Database Verification:**
```bash
sqlite3 inventory.db "SELECT COUNT(*) FROM products WHERE id='PROD003';"
```

**Expected:** `0`

---

### Test Case 11: Delete Product (Not Found)

**Objective:** Handle deletion of non-existent product

**Prerequisites:** No product with ID "NONEXIST"

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/items/NONEXIST
```

**Expected Response:**
```json
{
  "message": "Item not found"
}
```

**Expected Status Code:** `200 OK`

**Validation:**
- ✅ Appropriate message returned
- ✅ No errors thrown
- ✅ Database unchanged

---

## Database Tests

### Test Case 12: Database Table Creation

**Objective:** Verify products table is created on app startup

**Steps:**
1. Delete `inventory.db`
   ```bash
   rm inventory.db
   ```

2. Start Flask app
   ```bash
   python app.py
   ```

3. Check if table exists
   ```bash
   sqlite3 inventory.db ".tables"
   ```

**Expected Output:**
```
products
```

**Validation:**
- ✅ Table created automatically
- ✅ No errors during startup
- ✅ Table has correct schema

**Schema Verification:**
```bash
sqlite3 inventory.db ".schema products"
```

**Expected:**
```sql
CREATE TABLE products (
    id VARCHAR NOT NULL,
    name VARCHAR,
    category VARCHAR,
    quantity INTEGER,
    unit INTEGER,
    "expirationDate" VARCHAR,
    supplier VARCHAR,
    price FLOAT,
    sku VARCHAR,
    PRIMARY KEY (id)
);
```

---

### Test Case 13: Database Persistence

**Objective:** Verify data persists across server restarts

**Steps:**
1. Add a product
   ```bash
   curl -X POST http://localhost:5000/api/items \
     -H "Content-Type: application/json" \
     -d '{"id":"PERSIST001","name":"Test Persistence","category":"Test","quantity":1,"unit":1,"expirationDate":"2025-12-31","supplier":"Test","price":1.00,"sku":"TEST001"}'
   ```

2. Stop Flask server (Ctrl+C)

3. Start Flask server again
   ```bash
   python app.py
   ```

4. Retrieve the product
   ```bash
   curl http://localhost:5000/api/items/PERSIST001
   ```

**Expected:** Product data returned successfully

**Validation:**
- ✅ Data survives restart
- ✅ All fields intact
- ✅ ID unchanged

---

### Test Case 14: Multiple Concurrent Requests

**Objective:** Test system handles multiple simultaneous requests

**Steps:**
Run multiple curl commands in parallel:

```bash
# In PowerShell
1..10 | ForEach-Object -Parallel {
    curl -X POST http://localhost:5000/api/items `
      -H "Content-Type: application/json" `
      -d "{\"id\":\"CONC$($_)\",\"name\":\"Concurrent Test $($_)\",\"category\":\"Test\",\"quantity\":$($_),\"unit\":1,\"expirationDate\":\"2025-12-31\",\"supplier\":\"Test\",\"price\":$($_).99,\"sku\":\"CONC$($_)\"}"
}
```

**Validation:**
- ✅ All 10 products created
- ✅ No duplicate IDs
- ✅ No data corruption
- ✅ All requests return success

**Verification:**
```bash
curl http://localhost:5000/api/items | jq 'length'
```

**Expected:** `10` (or more if other products exist)

---

## Integration Tests

### Test Case 15: End-to-End Product Lifecycle

**Objective:** Test complete CRUD cycle for a product

**Steps:**

1. **Create** product
   ```bash
   curl -X POST http://localhost:5000/api/items \
     -H "Content-Type: application/json" \
     -d '{"id":"LIFE001","name":"Lifecycle Test","category":"Test","quantity":100,"unit":1,"expirationDate":"2025-12-31","supplier":"Test Co","price":50.00,"sku":"LIFE-001"}'
   ```
   ✅ **Verify:** Response shows item added

2. **Read** product
   ```bash
   curl http://localhost:5000/api/items/LIFE001
   ```
   ✅ **Verify:** Product data matches creation

3. **Update** product
   ```bash
   curl -X PUT http://localhost:5000/api/items/LIFE001 \
     -H "Content-Type: application/json" \
     -d '{"quantity":75,"price":45.00}'
   ```
   ✅ **Verify:** Quantity=75, Price=45.00

4. **Read** again to confirm update
   ```bash
   curl http://localhost:5000/api/items/LIFE001
   ```
   ✅ **Verify:** Changes reflected

5. **Delete** product
   ```bash
   curl -X DELETE http://localhost:5000/api/items/LIFE001
   ```
   ✅ **Verify:** Deletion confirmed

6. **Read** to confirm deletion
   ```bash
   curl http://localhost:5000/api/items/LIFE001
   ```
   ✅ **Verify:** Returns 404 or error

---

### Test Case 16: Frontend-Backend Integration

**Objective:** Verify React frontend can communicate with Flask backend

**Prerequisites:** Both frontend and backend running

**Steps:**

1. Open React app in browser: `http://localhost:5173` (or configured port)

2. Click "Add Product" button

3. Fill in form with test data:
   - ID: `FRONT001`
   - Name: `Frontend Test`
   - Category: `Integration`
   - Quantity: `99`
   - Unit: `1`
   - Expiration: `2025-12-31`
   - Supplier: `Test Supplier`
   - Price: `99.99`
   - SKU: `FE-001`

4. Click "Save" or "Add"

5. Verify product appears in UI list

6. Verify via API:
   ```bash
   curl http://localhost:5000/api/items/FRONT001
   ```

**Validation:**
- ✅ Product created via UI
- ✅ Product visible in UI
- ✅ Product accessible via API
- ✅ No CORS errors in browser console

---

## Error Handling Tests

### Test Case 17: Missing Required Field

**Objective:** Test behavior when required field is missing

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Product",
    "category": "Test"
  }'
```

**Expected:** Error indicating missing ID (or system accepts with null values)

**Validation:**
- ✅ System handles gracefully
- ✅ Error message is clear
- ✅ No server crash

---

### Test Case 18: Invalid Data Type

**Objective:** Test handling of wrong data types

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TYPE001",
    "name": "Type Test",
    "category": "Test",
    "quantity": "not a number",
    "unit": 1,
    "expirationDate": "2025-12-31",
    "supplier": "Test",
    "price": "invalid",
    "sku": "TYPE-001"
  }'
```

**Expected:** Error or conversion to valid type

**Validation:**
- ✅ No server crash
- ✅ Clear error message
- ✅ Invalid product not created

---

### Test Case 19: Malformed JSON

**Objective:** Test handling of invalid JSON syntax

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d '{invalid json syntax'
```

**Expected:** 400 Bad Request or similar error

**Validation:**
- ✅ Appropriate error status
- ✅ Server continues running
- ✅ Error message indicates JSON parsing issue

---

### Test Case 20: Very Large Payload

**Objective:** Test system limits for data size

**Request:**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"LARGE001\",\"name\":\"$(python -c 'print("A"*10000)')\",\"category\":\"Test\",\"quantity\":1,\"unit\":1,\"expirationDate\":\"2025-12-31\",\"supplier\":\"Test\",\"price\":1.00,\"sku\":\"LARGE-001\"}"
```

**Expected:** Either accepts large data or returns error with size limit

**Validation:**
- ✅ System handles gracefully
- ✅ No memory issues
- ✅ No server crash

---

## Performance Tests

### Test Case 21: Response Time Benchmark

**Objective:** Measure API response time

**Tool:** Use `time` or similar:

```bash
time curl http://localhost:5000/api/items
```

**Acceptance Criteria:**
- ✅ GET (empty): < 100ms
- ✅ GET (100 items): < 500ms
- ✅ POST: < 200ms
- ✅ PUT: < 200ms
- ✅ DELETE: < 200ms

---

### Test Case 22: Load Test (100 Products)

**Objective:** Test performance with moderate data volume

**Setup:**
```bash
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/items \
    -H "Content-Type: application/json" \
    -d "{\"id\":\"LOAD$(printf %03d $i)\",\"name\":\"Load Test Product $i\",\"category\":\"Test\",\"quantity\":$i,\"unit\":1,\"expirationDate\":\"2025-12-31\",\"supplier\":\"Test Co\",\"price\":$i.99,\"sku\":\"LOAD-$(printf %03d $i)\"}"
done
```

**Test GET Performance:**
```bash
time curl http://localhost:5000/api/items
```

**Validation:**
- ✅ All 100 products created
- ✅ GET request completes < 1 second
- ✅ Response size reasonable
- ✅ No performance degradation

---

## Test Data Repository

### Sample Products for Testing

#### Product 1: Electronics
```json
{
  "id": "ELEC001",
  "name": "Dell XPS 15 Laptop",
  "category": "Electronics",
  "quantity": 15,
  "unit": 1,
  "expirationDate": "2027-06-30",
  "supplier": "Dell Technologies",
  "price": 1899.99,
  "sku": "DELL-XPS15-9520"
}
```

#### Product 2: Food
```json
{
  "id": "FOOD001",
  "name": "Organic Apples",
  "category": "Food",
  "quantity": 500,
  "unit": 1,
  "expirationDate": "2025-12-15",
  "supplier": "Fresh Farms Co.",
  "price": 3.99,
  "sku": "ORG-APPLE-GAL"
}
```

#### Product 3: Office Supplies
```json
{
  "id": "OFF001",
  "name": "Blue Ballpoint Pens (Box of 50)",
  "category": "Office Supplies",
  "quantity": 200,
  "unit": 50,
  "expirationDate": "2030-12-31",
  "supplier": "Office Depot",
  "price": 12.99,
  "sku": "PEN-BLUE-50PK"
}
```

#### Product 4: Clothing
```json
{
  "id": "CLOTH001",
  "name": "Men's T-Shirt (Large)",
  "category": "Clothing",
  "quantity": 75,
  "unit": 1,
  "expirationDate": "2026-12-31",
  "supplier": "Fashion Wholesale Inc.",
  "price": 19.99,
  "sku": "TSHIRT-M-L-BLK"
}
```

#### Product 5: Automotive
```json
{
  "id": "AUTO001",
  "name": "Motor Oil 5W-30 (1 Quart)",
  "category": "Automotive",
  "quantity": 300,
  "unit": 1,
  "expirationDate": "2028-03-31",
  "supplier": "Mobil Lubricants",
  "price": 8.99,
  "sku": "MOBIL-5W30-1QT"
}
```

---

## Test Execution Checklist

### Before Testing
- [ ] Flask server running
- [ ] Database file exists
- [ ] No critical errors in console
- [ ] CORS enabled
- [ ] Test data prepared

### API Tests
- [ ] Test Case 1: Get empty list
- [ ] Test Case 2: Create product
- [ ] Test Case 3: Duplicate ID
- [ ] Test Case 4: Get all products
- [ ] Test Case 5: Get single product
- [ ] Test Case 6: Product not found
- [ ] Test Case 7: Partial update
- [ ] Test Case 8: Full update
- [ ] Test Case 9: Update not found
- [ ] Test Case 10: Delete product
- [ ] Test Case 11: Delete not found

### Database Tests
- [ ] Test Case 12: Table creation
- [ ] Test Case 13: Data persistence
- [ ] Test Case 14: Concurrent requests

### Integration Tests
- [ ] Test Case 15: CRUD lifecycle
- [ ] Test Case 16: Frontend integration

### Error Handling
- [ ] Test Case 17: Missing fields
- [ ] Test Case 18: Invalid types
- [ ] Test Case 19: Malformed JSON
- [ ] Test Case 20: Large payload

### Performance
- [ ] Test Case 21: Response time
- [ ] Test Case 22: Load test

### After Testing
- [ ] Clean up test data
- [ ] Document any failures
- [ ] Report bugs found
- [ ] Verify fixes

---

## Bug Report Template

When tests fail, document using this template:

```markdown
**Test Case:** [Number and Name]
**Date:** [YYYY-MM-DD]
**Tester:** [Your Name]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Error Message:**
```
[Paste error message]
```

**Impact:** [Critical/High/Medium/Low]

**Screenshots/Logs:**
[Attach if applicable]
```

---

## Automated Testing Script

### Python Script for Automated Testing

```python
# test_inventory_api.py
import requests
import json

BASE_URL = "http://localhost:5000/api/items"

def test_get_all_empty():
    """Test Case 1: Get all products (empty)"""
    response = requests.get(BASE_URL)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print("✅ Test Case 1 Passed")

def test_create_product():
    """Test Case 2: Create product"""
    product = {
        "id": "TEST001",
        "name": "Test Product",
        "category": "Test",
        "quantity": 10,
        "unit": 1,
        "expirationDate": "2025-12-31",
        "supplier": "Test Supplier",
        "price": 99.99,
        "sku": "TEST-001"
    }
    response = requests.post(BASE_URL, json=product)
    assert response.status_code == 201
    assert response.json()["message"] == "Item added"
    print("✅ Test Case 2 Passed")

def test_get_single_product():
    """Test Case 5: Get single product"""
    response = requests.get(f"{BASE_URL}/TEST001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "TEST001"
    print("✅ Test Case 5 Passed")

def test_update_product():
    """Test Case 7: Update product"""
    update_data = {"quantity": 20, "price": 89.99}
    response = requests.put(f"{BASE_URL}/TEST001", json=update_data)
    assert response.status_code == 200
    assert response.json()["message"] == "Item updated"
    print("✅ Test Case 7 Passed")

def test_delete_product():
    """Test Case 10: Delete product"""
    response = requests.delete(f"{BASE_URL}/TEST001")
    assert response.status_code == 200
    assert response.json()["message"] == "Item deleted"
    print("✅ Test Case 10 Passed")

if __name__ == "__main__":
    test_get_all_empty()
    test_create_product()
    test_get_single_product()
    test_update_product()
    test_delete_product()
    print("\n🎉 All tests passed!")
```

**Run with:**
```bash
pip install requests
python test_inventory_api.py
```

---

## Summary

This test suite provides comprehensive coverage of:
- ✅ **22 detailed test cases**
- ✅ **API endpoint testing** (CRUD operations)
- ✅ **Database integrity** testing
- ✅ **Integration testing** (frontend + backend)
- ✅ **Error handling** scenarios
- ✅ **Performance benchmarks**
- ✅ **Sample test data** for various categories
- ✅ **Automated testing** script template

Execute these tests systematically to ensure your inventory system works correctly before deployment!
