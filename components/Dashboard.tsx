import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import type { Product } from '../App';
import { StatsCard } from './StatsCard';
import { LowStockAlert } from './LowStockAlert';
import { CategoryChart } from './CategoryChart';

interface DashboardProps {
  products: Product[];
}

export function Dashboard({ products }: DashboardProps) {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel);
  
  // Calculate expiring soon (within 90 days)
  const today = new Date();
  const expiringSoon = products.filter(p => {
    const expirationDate = new Date(p.expirationDate);
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems.length.toString()}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringSoon.length.toString()}
          icon={TrendingUp}
          color="red"
        />
        <StatsCard
          title="Total Inventory Value"
          value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart products={products} />
        <LowStockAlert products={lowStockItems} />
      </div>
    </div>
  );
}
