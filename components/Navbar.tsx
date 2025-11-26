import { Package, LayoutDashboard, Plus, Settings as SettingsIcon, ShoppingCart, AlertOctagon } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'inventory' | 'purchase-orders' | 'damaged-returns' | 'settings';
  onViewChange: (view: 'dashboard' | 'inventory' | 'purchase-orders' | 'damaged-returns' | 'settings') => void;
  onAddProduct: () => void;
}

export function Navbar({ currentView, onViewChange, onAddProduct }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">SupplementStock</h1>
              <p className="text-xs text-gray-500">Inventory Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'inventory'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => onViewChange('purchase-orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'purchase-orders'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Purchase Orders</span>
            </button>

            <button
              onClick={() => onViewChange('damaged-returns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'damaged-returns'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertOctagon className="h-5 w-5" />
              <span>Damaged/Returns</span>
            </button>

            <button
              onClick={() => onViewChange('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </button>

            <button
              onClick={onAddProduct}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ml-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}