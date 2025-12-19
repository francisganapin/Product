# Delete Item API Documentation

## Overview

This document provides comprehensive documentation on how to delete items from the inventory using the REST API. The delete functionality allows you to remove items from the inventory by their unique identifier.

---

## API Endpoint

### Delete Item by ID

**Endpoint:** `DELETE /inventory/<item_id>`

**Description:** Deletes a specific item from the inventory using its unique ID.

**HTTP Method:** `DELETE`

**URL Structure:**
```
DELETE /inventory/{item_id}
```

---

## Request Details

### URL Parameters

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| `item_id` | string | Yes      | The unique identifier of the item to delete |

### Headers

```http
Content-Type: application/json
```

### Request Body

No request body is required for the DELETE operation.

---

## Response Details

### Success Response (200 OK)

**Status Code:** `200`

**Response Body:**
```json
{
  "message": "Item deleted"
}
```

### Example Response

```json
{
  "message": "Item deleted"
}
```

---

## Code Implementation

### Backend Route (inventory_routes.py)

The delete endpoint is defined in [inventory_routes.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/inventory_api/api/inventory_routes.py#L29-L32):

```python
@inventory_bp.route("/<item_id>", methods=['DELETE'])
def delete_item(item_id):
    service.delete_item(item_id)
    return jsonify({'message': 'Item deleted'}), 200
```

### Service Layer (inventory_service.py)

The delete logic is implemented in [inventory_service.py](file:///c:/Users/francis/OneDrive/Desktop/Templated/inventory_api/services/inventory_service.py#L53-L56):

```python
def delete_item(self, item_id):
    exists = any(i['id'] == item_id for i in self.inventory)
    self.inventory = [i for i in self.inventory if i['id'] != item_id]
    return {'message': 'Item deleted'} if exists else {'message': 'Item not found'}
```

**How it works:**
1. **Check if item exists:** Uses `any()` to determine if an item with the given `item_id` exists in the inventory
2. **Filter out the item:** Creates a new list excluding the item with the matching `item_id`
3. **Return result:** Returns a success or not-found message based on whether the item existed

---

## Usage Examples

### 1. Using cURL

```bash
curl -X DELETE http://localhost:5000/inventory/1
```

**Expected Response:**
```json
{
  "message": "Item deleted"
}
```

### 2. Using JavaScript (Fetch API)

```javascript
async function deleteItem(itemId) {
  try {
    const response = await fetch(`http://localhost:5000/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.message);
      return data;
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
deleteItem('1');
```

### 3. Using Python (requests library)

```python
import requests

def delete_item(item_id):
    url = f"http://localhost:5000/inventory/{item_id}"
    
    response = requests.delete(url)
    
    if response.status_code == 200:
        print(f"Success: {response.json()}")
    else:
        print(f"Error: {response.status_code}")

# Usage
delete_item('1')
```

### 4. Using Postman

1. **Method:** Select `DELETE`
2. **URL:** `http://localhost:5000/inventory/1`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Click:** Send button

### 5. Using jQuery AJAX

```javascript
$.ajax({
  url: 'http://localhost:5000/inventory/1',
  type: 'DELETE',
  contentType: 'application/json',
  success: function(response) {
    console.log('Item deleted:', response.message);
  },
  error: function(xhr, status, error) {
    console.error('Error deleting item:', error);
  }
});
```

---

## Complete Workflow Example

Here's a complete example showing how to delete an item from a frontend application:

### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Delete Item Example</title>
</head>
<body>
    <h1>Delete Inventory Item</h1>
    
    <div>
        <label for="itemId">Item ID:</label>
        <input type="text" id="itemId" placeholder="Enter item ID">
        <button onclick="deleteInventoryItem()">Delete Item</button>
    </div>
    
    <div id="result"></div>

    <script src="app.js"></script>
</body>
</html>
```

### JavaScript (app.js)

```javascript
const API_BASE_URL = 'http://localhost:5000';

async function deleteInventoryItem() {
    const itemId = document.getElementById('itemId').value;
    
    if (!itemId) {
        alert('Please enter an item ID');
        return;
    }
    
    try {
        // Show loading indicator
        document.getElementById('result').innerHTML = 'Deleting item...';
        
        const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success
            document.getElementById('result').innerHTML = 
                `<p style="color: green;">✓ ${data.message}</p>`;
            
            // Clear the input field
            document.getElementById('itemId').value = '';
            
            // Optionally refresh the item list
            // await loadItems();
        } else {
            // Error
            document.getElementById('result').innerHTML = 
                `<p style="color: red;">✗ Error: ${data.error || 'Failed to delete item'}</p>`;
        }
    } catch (error) {
        console.error('Network error:', error);
        document.getElementById('result').innerHTML = 
            `<p style="color: red;">✗ Network error: ${error.message}</p>`;
    }
}
```

---

## Error Handling Improvements

> [!IMPORTANT]
> The current implementation always returns a 200 status code, even if the item doesn't exist. Consider implementing proper error handling.

### Recommended Enhancement

Update the route handler to return a 404 error when the item is not found:

```python
@inventory_bp.route("/<item_id>", methods=['DELETE'])
def delete_item(item_id):
    result = service.delete_item(item_id)
    
    if result.get('message') == 'Item not found':
        return jsonify({'error': 'Item not found'}), 404
    
    return jsonify({'message': 'Item deleted'}), 200
```

This would provide better API semantics and make it easier for clients to handle different scenarios.

---

## Integration with Frontend

### React/TypeScript Example

```typescript
interface DeleteItemResponse {
  message: string;
  error?: string;
}

const deleteItem = async (itemId: string): Promise<void> => {
  try {
    const response = await fetch(`/inventory/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeleteItemResponse = await response.json();
    
    if (data.error) {
      console.error('Server error:', data.error);
      // Handle error (show toast, alert, etc.)
    } else {
      console.log('Success:', data.message);
      // Update UI, refresh list, show success message
    }
  } catch (error) {
    console.error('Failed to delete item:', error);
    // Handle network error
  }
};
```

### Vue.js Example

```javascript
export default {
  methods: {
    async deleteItem(itemId) {
      try {
        const response = await this.$http.delete(`/inventory/${itemId}`);
        
        if (response.status === 200) {
          this.$notify({
            type: 'success',
            message: 'Item deleted successfully'
          });
          
          // Refresh the inventory list
          await this.fetchInventory();
        }
      } catch (error) {
        this.$notify({
          type: 'error',
          message: 'Failed to delete item'
        });
        console.error('Delete error:', error);
      }
    }
  }
}
```

---

## Testing

### Manual Testing Steps

1. **Get list of items** to find a valid `item_id`:
   ```bash
   curl http://localhost:5000/inventory
   ```

2. **Delete an item** using a valid ID:
   ```bash
   curl -X DELETE http://localhost:5000/inventory/1
   ```

3. **Verify deletion** by getting the item (should return 404 or item not found):
   ```bash
   curl http://localhost:5000/inventory/1
   ```

### Automated Test Example (pytest)

```python
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_delete_item_success(client):
    """Test successful deletion of an item"""
    response = client.delete('/inventory/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Item deleted'

def test_delete_nonexistent_item(client):
    """Test deletion of non-existent item"""
    response = client.delete('/inventory/999')
    # Current implementation returns 200
    # Ideally should return 404
    assert response.status_code == 200
```

---

## Security Considerations

> [!WARNING]
> Important security considerations when implementing delete operations:

1. **Authentication:** Ensure only authorized users can delete items
2. **Authorization:** Verify the user has permission to delete the specific item
3. **Soft Delete:** Consider implementing soft delete (marking as deleted) instead of hard delete to maintain data integrity
4. **Audit Trail:** Log all delete operations with timestamp and user information
5. **Rate Limiting:** Implement rate limiting to prevent abuse

### Example with Authentication

```python
from flask import Blueprint, request, jsonify
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not validate_token(auth_header):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@inventory_bp.route("/<item_id>", methods=['DELETE'])
@require_auth
def delete_item(item_id):
    result = service.delete_item(item_id)
    return jsonify(result), 200
```

---

## Common Issues and Troubleshooting

### Issue 1: CORS Error

**Problem:** Browser blocks the DELETE request due to CORS policy

**Solution:** Enable CORS in your Flask application:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

### Issue 2: 404 Not Found on DELETE

**Problem:** DELETE endpoint returns 404

**Solutions:**
- Verify the blueprint is registered correctly
- Check the URL format (should include `/inventory/` prefix)
- Ensure Flask app is running

### Issue 3: Item Not Actually Deleted

**Problem:** API returns success but item still exists

**Solutions:**
- Check if you're using the correct `item_id`
- Verify the service layer is properly updating the inventory
- Check if you're using a database vs in-memory storage (changes may not persist)

---

## Best Practices

1. **Always validate the item_id** before attempting deletion
2. **Return appropriate HTTP status codes** (200 for success, 404 for not found)
3. **Implement soft delete** for important data
4. **Add confirmation dialogs** in the UI before deletion
5. **Log all delete operations** for audit purposes
6. **Handle errors gracefully** with user-friendly messages
7. **Use transactions** when working with databases to ensure data consistency

---

## Related Documentation

- [Update Item API Documentation](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/Documentation/update_item_method_documentation.md)
- [Comprehensive Inventory System Documentation](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/Documentation/comprehensive_inventory_system_documentation.md)
- [API Endpoint Troubleshooting](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/Documentation/api_endpoint_troubleshooting.md)

---

## Summary

The Delete Item API provides a simple way to remove items from the inventory. The endpoint accepts a DELETE request with an item ID and returns a success message upon completion. Consider implementing the recommended error handling improvements and security measures for production use.

**Quick Reference:**
- **Endpoint:** `DELETE /inventory/<item_id>`
- **Response:** `{"message": "Item deleted"}`
- **Status Code:** `200`
