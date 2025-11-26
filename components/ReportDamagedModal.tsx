import { useState } from 'react';
import { X } from 'lucide-react';
import type { Product, DamagedReturn } from '../App';

interface ReportDamagedModalProps {
  products: Product[];
  onClose: () => void;
  onCreate: (report: Omit<DamagedReturn, 'id'>) => void;
}

export function ReportDamagedModal({ products, onClose, onCreate }: ReportDamagedModalProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState<'damaged' | 'returned'>('damaged');
  const [reason, setReason] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleProductChange = (productName: string) => {
    setSelectedProduct(productName);
    const product = products.find(p => p.name === productName);
    if (product) {
      setBatchNumber(product.batchNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.name === selectedProduct);
    if (!product) return;

    onCreate({
      productName: selectedProduct,
      sku: product.sku,
      quantity: Number(quantity),
      type,
      reason,
      reportDate: new Date().toISOString().split('T')[0],
      batchNumber,
      status: 'reported',
      resolutionNotes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Report Damaged/Returned Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Product *</label>
              <select
                required
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Type *</label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value as 'damaged' | 'returned')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="damaged">Damaged</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Batch Number */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Batch Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Reason *</label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe the issue..."
              />
            </div>

            {/* Resolution Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-2">Resolution Notes (Optional)</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Add resolution notes if applicable..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Report Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
