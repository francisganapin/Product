import { useState } from 'react';
import { Package, Calendar, AlertCircle, FileText, Trash2, Edit2 } from 'lucide-react';
import type { DamagedReturn } from '../App';
import { EditDamagedModal } from './EditDamagedModal';

interface DamagedReturnCardProps {
  report: DamagedReturn;
  onUpdate: (report: DamagedReturn) => void;
  onDelete: (id: string) => void;
}

const typeColors = {
  damaged: 'bg-red-100 text-red-700 border-red-200',
  returned: 'bg-orange-100 text-orange-700 border-orange-200'
};

const statusColors = {
  reported: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200'
};

export function DamagedReturnCard({ report, onUpdate, onDelete }: DamagedReturnCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-gray-900 mb-2">{report.productName}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs border ${typeColors[report.type]}`}>
                {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[report.status]}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
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
                if (confirm('Are you sure you want to delete this report?')) {
                  onDelete(report.id);
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">SKU</p>
              <p className="text-gray-900">{report.sku}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Quantity</p>
              <p className="text-gray-900">{report.quantity} units</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Report Date</p>
              <p className="text-gray-900">{new Date(report.reportDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Batch Number</p>
              <p className="text-gray-900">{report.batchNumber}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-700">{report.reason}</p>
            </div>
          </div>
        </div>

        {/* Resolution Notes */}
        {report.resolutionNotes && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-green-700 mb-1">Resolution Notes</p>
                <p className="text-sm text-green-900">{report.resolutionNotes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditDamagedModal
          report={report}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
