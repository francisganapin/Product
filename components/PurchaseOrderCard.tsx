import { useState } from 'react';
import { Calendar, Package, DollarSign, FileText, Trash2, Edit2, CheckCircle } from 'lucide-react';
import type { PurchaseOrder } from '../App';
import { EditPOModal } from './EditPOModal';

interface PurchaseOrderCardProps {
  purchaseOrder: PurchaseOrder;
  onUpdate: (po: PurchaseOrder) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  received: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};

export function PurchaseOrderCard({ purchaseOrder, onUpdate, onDelete }: PurchaseOrderCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleMarkAsReceived = () => {
    onUpdate({ ...purchaseOrder, status: 'received' });
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-gray-900">{purchaseOrder.orderNumber}</h3>
              <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[purchaseOrder.status]}`}>
                {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-600">Supplier: {purchaseOrder.supplier}</p>
          </div>
          <div className="flex items-center gap-2">
            {purchaseOrder.status === 'shipped' && (
              <button
                onClick={handleMarkAsReceived}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Mark as Received"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${purchaseOrder.orderNumber}?`)) {
                  onDelete(purchaseOrder.id);
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Order Date</p>
              <p className="text-gray-900">{new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Expected Date</p>
              <p className="text-gray-900">{new Date(purchaseOrder.expectedDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-gray-900">{purchaseOrder.items.length} product(s)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-gray-900">${purchaseOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-600">Product</th>
                <th className="px-4 py-2 text-left text-xs text-gray-600">SKU</th>
                <th className="px-4 py-2 text-right text-xs text-gray-600">Quantity</th>
                <th className="px-4 py-2 text-right text-xs text-gray-600">Unit Price</th>
                <th className="px-4 py-2 text-right text-xs text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {purchaseOrder.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {purchaseOrder.notes && (
          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{purchaseOrder.notes}</p>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditPOModal
          purchaseOrder={purchaseOrder}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
