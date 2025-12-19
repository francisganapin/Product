# Comprehensive Pagination Implementation Guide

## Overview

This guide provides a complete implementation of pagination for your inventory list, covering both backend API and frontend React components. Pagination improves performance and user experience when dealing with large datasets.

---

## Why Pagination?

### Benefits

✅ **Better Performance** - Load only the data you need  
✅ **Faster Page Load** - Smaller response payloads  
✅ **Better UX** - Users can navigate through pages easily  
✅ **Reduced Memory Usage** - Less data in browser memory  
✅ **Scalability** - Handle thousands of items efficiently  

### Example Scenario

Without pagination:
- Database has 1,000 products
- Loading all 1,000 products at once
- Slow response time
- Large memory footprint

With pagination:
- Show 10-20 products per page
- Fast response time
- Manageable data chunks

---

## Backend Implementation (Flask API)

### Pagination Strategy

We'll implement **offset-based pagination** using query parameters:

```
GET /api/items?page=1&per_page=20
```

**Parameters:**
- `page`: Current page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

### Updated `inventory_service.py`

Add pagination support to the `get_items` method:

```python
def get_items(self, page=1, per_page=20):
    """
    Get paginated items from database.
    
    Args:
        page (int): Page number (1-indexed)
        per_page (int): Number of items per page (max 100)
        
    Returns:
        dict: Paginated results with metadata
    """
    # Ensure valid pagination parameters
    page = max(1, page)  # Page must be at least 1
    per_page = min(max(1, per_page), 100)  # Between 1 and 100
    
    # Calculate offset
    offset = (page - 1) * per_page
    
    # Get total count
    total_items = self.session.query(Product).count()
    
    # Get paginated products
    products = self.session.query(Product)\
        .offset(offset)\
        .limit(per_page)\
        .all()
    
    # Calculate pagination metadata
    total_pages = (total_items + per_page - 1) // per_page  # Ceiling division
    has_next = page < total_pages
    has_prev = page > 1
    
    # Format products
    items = [{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'quantity': p.quantity,
        'unit': p.unit,
        'expirationDate': p.expirationDate,
        'supplier': p.supplier,
        'price': p.price,
        'sku': p.sku,
        'reorderLevel': p.reorderLevel,
        'batchNumber': p.batchNumber
    } for p in products]
    
    return {
        'items': items,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_items': total_items,
            'total_pages': total_pages,
            'has_next': has_next,
            'has_prev': has_prev
        }
    }
```

### Updated `inventory_routes.py`

Modify the GET endpoint to accept pagination parameters:

```python
@inventory_bp.route("", methods=['GET'])
def get_items():
    """
    Get paginated list of items.
    
    Query Parameters:
        page (int): Page number (default: 1)
        per_page (int): Items per page (default: 20, max: 100)
        
    Returns:
        JSON with items array and pagination metadata
    """
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Get paginated results
    result = service.get_items(page=page, per_page=per_page)
    
    return jsonify(result), 200
```

### API Response Format

**Request:**
```http
GET /api/items?page=2&per_page=10
```

**Response:**
```json
{
  "items": [
    {
      "id": "11",
      "name": "Product 11",
      "category": "Vitamins",
      "quantity": 100,
      "unit": "bottles",
      "expirationDate": "2026-08-15",
      "supplier": "Supplier A",
      "price": 24.99,
      "sku": "PROD-011",
      "reorderLevel": 50,
      "batchNumber": "BATCH-001"
    },
    // ... 9 more items
  ],
  "pagination": {
    "page": 2,
    "per_page": 10,
    "total_items": 45,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## Frontend Implementation (React/TypeScript)

### Step 1: Update Type Definitions

Add pagination types to your `App.tsx`:

```typescript
export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse {
  items: Product[];
  pagination: PaginationInfo;
}
```

### Step 2: Update App Component State

Modify [App.tsx](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/App.tsx) to track pagination:

```typescript
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inventory' | 'purchase-orders' | 'damaged-returns' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load products with pagination
  const loadProducts = async (page = 1, perPage = itemsPerPage) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/items?page=${page}&per_page=${perPage}`
      );
      
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setProducts(data.items);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        console.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts(1, itemsPerPage);
  }, []);

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.has_next) {
      loadProducts(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination?.has_prev) {
      loadProducts(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handlePerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    loadProducts(1, perPage);
  };

  // ... rest of your component
}
```

### Step 3: Create Pagination Component

Create a new file `components/Pagination.tsx`:

```typescript
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  hasNext,
  hasPrev,
  onPageChange,
  onPerPageChange,
  isLoading = false
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum page numbers to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items info */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> items
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev || isLoading}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400">
                  {page}
                </span>
              )
            )}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext || isLoading}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm text-gray-600">
            Per page:
          </label>
          <select
            id="perPage"
            value={itemsPerPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### Step 4: Update InventoryList Component

Modify [InventoryList.tsx](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/components/InventoryList.tsx) to include pagination:

```typescript
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Product } from '../App';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import type { PaginationInfo } from '../App';

interface InventoryListProps {
  products: Product[];
  pagination: PaginationInfo | null;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: Product) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading?: boolean;
}

export function InventoryList({ 
  products, 
  pagination,
  onDeleteProduct, 
  onUpdateProduct,
  onPageChange,
  onPerPageChange,
  isLoading = false
}: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Client-side filtering (applied to paginated results)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900 mb-2">Inventory Management</h2>
        <p className="text-gray-600">Manage your food supplement inventory</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No products found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={onDeleteProduct}
              onUpdate={onUpdateProduct}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          itemsPerPage={pagination.per_page}
          hasNext={pagination.has_next}
          hasPrev={pagination.has_prev}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
```

### Step 5: Wire It All Together in App.tsx

Complete implementation in [App.tsx](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/App.tsx):

```typescript
import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { AddProductModal } from './components/AddProductModal';
import { Settings } from './components/Settings';
import { PurchaseOrders } from './components/PurchaseOrders';
import { DamagedReturns } from './components/DamagedReturns';

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expirationDate: string;
  batchNumber: string;
  supplier: string;
  price: number;
  sku: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse {
  items: Product[];
  pagination: PaginationInfo;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inventory' | 'purchase-orders' | 'damaged-returns' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load products with pagination
  const loadProducts = async (page = 1, perPage = itemsPerPage) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/items?page=${page}&per_page=${perPage}`
      );
      
      if (response.ok) {
        const data: PaginatedResponse = await response.json();
        setProducts(data.items);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        console.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts(1, itemsPerPage);
  }, []);

  const handleAddProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    
    // TODO: Send to API
    // For now, add locally and reload
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
    
    // Reload to refresh pagination
    loadProducts(currentPage, itemsPerPage);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Reload current page
        loadProducts(currentPage, itemsPerPage);
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Network error');
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    // Optionally reload to sync with backend
    loadProducts(currentPage, itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    loadProducts(page, itemsPerPage);
  };

  const handlePerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    loadProducts(1, perPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddProduct={() => setIsAddModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard products={products} />
        ) : currentView === 'inventory' ? (
          <InventoryList
            products={products}
            pagination={pagination}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            isLoading={isLoading}
          />
        ) : currentView === 'purchase-orders' ? (
          <PurchaseOrders products={products} />
        ) : currentView === 'damaged-returns' ? (
          <DamagedReturns products={products} />
        ) : (
          <Settings />
        )}
      </main>

      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}
```

---

## Visual Examples

### Pagination Component Preview

```
┌────────────────────────────────────────────────────────────┐
│  Showing 21 to 40 of 156 items                             │
│                                                             │
│  [←] [1] ... [3] [4] [5] ... [8] [→]     Per page: [20 ▼] │
└────────────────────────────────────────────────────────────┘
```

---

## Advanced Features

### 1. Server-Side Search with Pagination

Modify backend to support search:

```python
def get_items(self, page=1, per_page=20, search=None, category=None):
    query = self.session.query(Product)
    
    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.like(search_filter)) | 
            (Product.sku.like(search_filter))
        )
    
    if category and category != 'all':
        query = query.filter(Product.category == category)
    
    # Get total count after filters
    total_items = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    # ... rest of pagination logic
```

Update route:

```python
@inventory_bp.route("", methods=['GET'])
def get_items():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', None, type=str)
    category = request.args.get('category', None, type=str)
    
    result = service.get_items(
        page=page, 
        per_page=per_page, 
        search=search, 
        category=category
    )
    
    return jsonify(result), 200
```

### 2. Cursor-Based Pagination (Alternative)

For very large datasets, use cursor-based pagination:

```python
def get_items_cursor(self, cursor=None, per_page=20):
    query = self.session.query(Product).order_by(Product.id)
    
    if cursor:
        query = query.filter(Product.id > cursor)
    
    products = query.limit(per_page + 1).all()
    
    has_next = len(products) > per_page
    if has_next:
        products = products[:per_page]
    
    next_cursor = products[-1].id if products and has_next else None
    
    return {
        'items': [/* formatted products */],
        'next_cursor': next_cursor,
        'has_next': has_next
    }
```

---

## Testing Pagination

### Backend Test

```python
# test_pagination.py
import requests

BASE_URL = 'http://localhost:5000/api/items'

def test_pagination():
    # Test first page
    response = requests.get(f"{BASE_URL}?page=1&per_page=10")
    data = response.json()
    
    print(f"Page 1:")
    print(f"  Items: {len(data['items'])}")
    print(f"  Total: {data['pagination']['total_items']}")
    print(f"  Has Next: {data['pagination']['has_next']}")
    
    # Test second page
    response = requests.get(f"{BASE_URL}?page=2&per_page=10")
    data = response.json()
    
    print(f"\nPage 2:")
    print(f"  Items: {len(data['items'])}")
    print(f"  Has Prev: {data['pagination']['has_prev']}")

if __name__ == '__main__':
    test_pagination()
```

---

## Best Practices

### ✅ DO

- Set reasonable default page size (20-50 items)
- Set maximum page size limit (100 items)
- Return pagination metadata with every response
- Handle edge cases (page 0, negative values)
- Show loading indicators during page transitions
- Maintain page state in URL (optional)

### ❌ DON'T

- Allow unlimited page sizes
- Forget to handle empty results
- Skip validation of page parameters
- Load all data then paginate client-side (for large datasets)

---

## Troubleshooting

### Issue: Pagination metadata is null

**Solution:** Ensure backend always returns pagination object

### Issue: Page buttons not working

**Solution:** Check that `onPageChange` is properly wired up

### Issue: Deleted item causes blank page

**Solution:** Reload current page after deletion, or go to previous page if current is empty

---

## Summary

**Backend Changes:**
1. ✅ Add pagination parameters to `get_items` method
2. ✅ Return pagination metadata
3. ✅ Update API route to accept query parameters

**Frontend Changes:**
1. ✅ Create `Pagination` component
2. ✅ Update `App.tsx` with pagination state
3. ✅ Modify `InventoryList` to use pagination
4. ✅ Add loading states

**Result:**
- Faster load times
- Better user experience
- Scalable to thousands of items

---

## Related Documentation

- [Delete Item API Documentation](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/Documentation/delete_item_api_documentation.md)
- [InventoryList Delete Functionality](file:///c:/Users/francis/OneDrive/Desktop/Templated/Inventory/Documentation/inventorylist_delete_functionality.md)

---

**Last Updated:** 2025-11-29  
**Version:** 1.0
