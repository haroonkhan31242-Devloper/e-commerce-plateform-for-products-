import React, { useState } from 'react';
import { Minus, PackageMinus, PackagePlus, Plus } from 'lucide-react';
import { AdminPanel, AdminSearchInput } from '../../../components/admin/AdminPanel.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';
import { useStore } from '../../../context/StoreContext.tsx';

export const InventoryTab: React.FC = () => {
  const { products, adjustStock } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.toLowerCase();
  const visibleProducts = products.filter(
    (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
  );

  return (
    <AdminPanel
      title="Inventory"
      description="Adjust stock and watch for low inventory."
      actions={
        <AdminSearchInput
          className="w-full sm:w-64"
          placeholder="Search name or SKU..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="data-table w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
              <th className="py-2.5">Product</th>
              <th className="py-2.5">SKU</th>
              <th className="py-2.5">Category</th>
              <th className="py-2.5">Available Units</th>
              <th className="py-2.5">Stock Health</th>
              <th className="py-2.5 text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleProducts.map((p) => {
              const isOut = p.stock <= 0;
              const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

              return (
                <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td data-label="" className="py-3 font-serif font-bold text-neutral-900">
                    {p.name}
                  </td>
                  <td data-label="SKU" className="py-3 font-mono text-neutral-600 whitespace-nowrap">{p.sku}</td>
                  <td data-label="Category" className="py-3 text-neutral-700">{p.categoryName}</td>
                  <td data-label="Available Units" className="py-3 font-mono font-bold text-neutral-900 text-sm">
                    {p.stock}
                  </td>
                  <td data-label="Stock Health" className="py-3">
                    {isOut ? (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-full">
                        Out of Stock
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td data-label="" className="py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => adjustStock(p.id, -1)}
                        disabled={p.stock <= 0}
                        aria-label={`Decrease stock of ${p.name} by 1`}
                        className="inline-flex items-center justify-center w-9 h-9 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => adjustStock(p.id, 1)}
                        aria-label={`Increase stock of ${p.name} by 1`}
                        className="inline-flex items-center justify-center w-9 h-9 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <ActionMenu
                        label={`More stock actions for ${p.name}`}
                        items={[
                          {
                            label: 'Add 10 units',
                            icon: <PackagePlus className="w-3.5 h-3.5" aria-hidden="true" />,
                            onSelect: () => adjustStock(p.id, 10),
                          },
                          {
                            label: 'Remove 5 units',
                            icon: <PackageMinus className="w-3.5 h-3.5" aria-hidden="true" />,
                            onSelect: () => adjustStock(p.id, -5),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {visibleProducts.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-600">No products match your search.</p>
      )}
    </AdminPanel>
  );
};
