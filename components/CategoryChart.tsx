import type { Product } from '../App';

interface CategoryChartProps {
  products: Product[];
}

export function CategoryChart({ products }: CategoryChartProps) {
  const categoryData = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.quantity;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...categories.map(c => c[1]));

  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-gray-900 mb-6">Inventory by Category</h3>
      
      <div className="space-y-4">
        {categories.map(([category, quantity], index) => {
          const percentage = (quantity / maxValue) * 100;
          
          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">{category}</span>
                <span className="text-gray-500">{quantity} units</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
