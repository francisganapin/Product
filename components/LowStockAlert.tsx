import { AlertTriangle } from 'lucide-react';
import type { Product } from '../App';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h3 className="text-gray-900">Low Stock Alerts</h3>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">All products are well stocked!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {products.map(product => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div>
                <p className="text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-700">{product.quantity} {product.unit}</p>
                <p className="text-xs text-gray-500">Reorder at: {product.reorderLevel}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
