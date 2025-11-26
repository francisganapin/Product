import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import type { Product, PurchaseOrder } from '../App';
import { PurchaseOrderCard } from './PurchaseOrderCard';
import { CreatePOModal } from './CreatePOModal';

interface PurchaseOrdersProps {
  products: Product[];
}

const initialPOs: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplier: 'NutriSupply Co.',
    orderDate: '2024-11-20',
    expectedDate: '2024-12-05',
    status: 'confirmed',
    items: [
      { productName: 'Vitamin D3 5000 IU', sku: 'VIT-D3-5000', quantity: 100, unitPrice: 24.99 }
    ],
    totalAmount: 2499.00,
    notes: 'Rush order for holiday season'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplier: 'Ocean Health Ltd.',
    orderDate: '2024-11-22',
    expectedDate: '2024-12-10',
    status: 'pending',
    items: [
      { productName: 'Omega-3 Fish Oil', sku: 'OM3-1000', quantity: 200, unitPrice: 32.50 }
    ],
    totalAmount: 6500.00,
    notes: 'Awaiting supplier confirmation'
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplier: 'ProFit Nutrition',
    orderDate: '2024-11-18',
    expectedDate: '2024-11-28',
    status: 'shipped',
    items: [
      { productName: 'Whey Protein Isolate', sku: 'WHEY-ISO-2LB', quantity: 150, unitPrice: 54.99 },
      { productName: 'Collagen Peptides', sku: 'COLL-PEP-1LB', quantity: 100, unitPrice: 39.99 }
    ],
    totalAmount: 12248.50,
    notes: 'Expected to arrive early'
  },
  {
    id: '4',
    orderNumber: 'PO-2024-004',
    supplier: 'MineralMax Inc.',
    orderDate: '2024-11-15',
    expectedDate: '2024-11-25',
    status: 'received',
    items: [
      { productName: 'Magnesium Citrate 400mg', sku: 'MAG-CIT-400', quantity: 300, unitPrice: 18.75 }
    ],
    totalAmount: 5625.00,
    notes: 'All items received and inspected'
  }
];

export function PurchaseOrders({ products }: PurchaseOrdersProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPOs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePO = (po: Omit<PurchaseOrder, 'id'>) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: Date.now().toString()
    };
    setPurchaseOrders([newPO, ...purchaseOrders]);
    setIsCreateModalOpen(false);
  };

  const handleUpdatePO = (updatedPO: PurchaseOrder) => {
    setPurchaseOrders(purchaseOrders.map(po => po.id === updatedPO.id ? updatedPO : po));
  };

  const handleDeletePO = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(po => po.id !== id));
  };

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Purchase Orders</h2>
          <p className="text-gray-600">Manage supplier orders and deliveries</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create PO</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO number or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-gray-900 mt-1">{purchaseOrders.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-orange-600 mt-1">
            {purchaseOrders.filter(po => po.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">In Transit</p>
          <p className="text-blue-600 mt-1">
            {purchaseOrders.filter(po => po.status === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-emerald-600 mt-1">
            ${purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredOrders.length} of {purchaseOrders.length} orders
        </p>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No purchase orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(po => (
            <PurchaseOrderCard
              key={po.id}
              purchaseOrder={po}
              onUpdate={handleUpdatePO}
              onDelete={handleDeletePO}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreatePOModal
          products={products}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreatePO}
        />
      )}
    </div>
  );
}
