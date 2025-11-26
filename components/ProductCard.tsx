import { useState } from 'react';
import { Trash2, Edit2, Calendar, Package, DollarSign, AlertCircle } from 'lucide-react';
import type { Product } from '../App';
import { EditProductModal } from './EditProductModal';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
}

export function ProductCard({ product, onDelete, onUpdate }: ProductCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const isLowStock = product.quantity <= product.reorderLevel;
  
  // Check if expiring soon (within 90 days)
  const today = new Date();
  const expirationDate = new Date(product.expirationDate);
  const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiration <= 90 && daysUntilExpiration > 0;

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                  onDelete(product.id);
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {(isLowStock || isExpiringSoon) && (
          <div className="mb-4 space-y-2">
            {isLowStock && (
              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Low stock - reorder recommended</span>
              </div>
            )}
            {isExpiringSoon && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Expires in {daysUntilExpiration} days</span>
              </div>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Package className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="text-gray-900">{product.quantity} {product.unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-gray-900">${product.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Expiration</p>
              <p className="text-gray-900">{new Date(product.expirationDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-gray-900">{product.category}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Batch Number</p>
              <p className="text-gray-900">{product.batchNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Supplier</p>
              <p className="text-gray-900">{product.supplier}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProductModal
          product={product}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
