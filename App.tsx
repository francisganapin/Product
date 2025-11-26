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

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  items: {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  notes: string;
}

export interface DamagedReturn {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  type: 'damaged' | 'returned';
  reason: string;
  reportDate: string;
  batchNumber: string;
  status: 'reported' | 'processing' | 'resolved';
  resolutionNotes: string;
}

// Initial sample data
const initialProducts: Product[] = [

];

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inventory' | 'purchase-orders' | 'damaged-returns' | 'settings'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load products from Flask backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/items')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error loading products:', err));
  }, []);

  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
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
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
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