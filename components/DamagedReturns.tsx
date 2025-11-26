import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import type { Product, DamagedReturn } from '../App';
import { DamagedReturnCard } from './DamagedReturnCard';
import { ReportDamagedModal } from './ReportDamagedModal';

interface DamagedReturnsProps {
  products: Product[];
}

const initialReports: DamagedReturn[] = [
  {
    id: '1',
    productName: 'Omega-3 Fish Oil',
    sku: 'OM3-1000',
    quantity: 5,
    type: 'damaged',
    reason: 'Bottles arrived broken during shipping',
    reportDate: '2024-11-24',
    batchNumber: 'OM-2024-042',
    status: 'processing',
    resolutionNotes: 'Contacted supplier for replacement'
  },
  {
    id: '2',
    productName: 'Probiotics 50 Billion CFU',
    sku: 'PRO-50B',
    quantity: 3,
    type: 'returned',
    reason: 'Customer return - wrong product ordered',
    reportDate: '2024-11-23',
    batchNumber: 'PR-2024-088',
    status: 'resolved',
    resolutionNotes: 'Restocked and issued refund to customer'
  },
  {
    id: '3',
    productName: 'Vitamin D3 5000 IU',
    sku: 'VIT-D3-5000',
    quantity: 10,
    type: 'damaged',
    reason: 'Water damage in storage area',
    reportDate: '2024-11-20',
    batchNumber: 'VD-2024-001',
    status: 'reported',
    resolutionNotes: ''
  },
  {
    id: '4',
    productName: 'Whey Protein Isolate',
    sku: 'WHEY-ISO-2LB',
    quantity: 2,
    type: 'returned',
    reason: 'Expired before customer use - refund requested',
    reportDate: '2024-11-19',
    batchNumber: 'WP-2024-203',
    status: 'resolved',
    resolutionNotes: 'Full refund issued, product disposed'
  }
];

export function DamagedReturns({ products }: DamagedReturnsProps) {
  const [reports, setReports] = useState<DamagedReturn[]>(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateReport = (report: Omit<DamagedReturn, 'id'>) => {
    const newReport: DamagedReturn = {
      ...report,
      id: Date.now().toString()
    };
    setReports([newReport, ...reports]);
    setIsReportModalOpen(false);
  };

  const handleUpdateReport = (updatedReport: DamagedReturn) => {
    setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const totalDamaged = reports.filter(r => r.type === 'damaged').reduce((sum, r) => sum + r.quantity, 0);
  const totalReturned = reports.filter(r => r.type === 'returned').reduce((sum, r) => sum + r.quantity, 0);
  const pendingReports = reports.filter(r => r.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 mb-2">Damaged & Returned Items</h2>
          <p className="text-gray-600">Track and manage product issues</p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-gray-900 mt-1">{reports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Damaged Items</p>
          <p className="text-red-600 mt-1">{totalDamaged} units</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Returned Items</p>
          <p className="text-orange-600 mt-1">{totalReturned} units</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending Resolution</p>
          <p className="text-blue-600 mt-1">{pendingReports}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="damaged">Damaged</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="processing">Processing</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <DamagedReturnCard
              key={report.id}
              report={report}
              onUpdate={handleUpdateReport}
              onDelete={handleDeleteReport}
            />
          ))}
        </div>
      )}

      {isReportModalOpen && (
        <ReportDamagedModal
          products={products}
          onClose={() => setIsReportModalOpen(false)}
          onCreate={handleCreateReport}
        />
      )}
    </div>
  );
}
