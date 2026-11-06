import React from 'react';
import { Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { AdminPanel, AdminSearchInput } from '../../../components/admin/AdminPanel.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';
import { Product } from '../../../types/index.ts';
import { getEffectivePrice, isOnSale } from '../../../utils/product.ts';
import { sizedImage } from '../../../utils/images.ts';

interface ProductsTabProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onEditProduct: (product: Product | null) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  searchQuery,
  onSearchQueryChange,
  onEditProduct,
}) => {
  const { products, deleteProduct, formatPrice, navigateToProduct } = useStore();
  const { confirm, dialog } = useConfirmDialog();

  const query = searchQuery.toLowerCase();
  const visibleProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query)
  );

  return (
    <AdminPanel
      title="Products"
      description="Manage prices, images, variations, and availability."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <AdminSearchInput
            className="flex-1 min-w-40 sm:w-64"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={onSearchQueryChange}
          />

          <button
            onClick={() => onEditProduct(null)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        </div>
      }
    >
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="data-table w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
              <th className="py-2.5">Item</th>
              <th className="py-2.5">SKU</th>
              <th className="py-2.5">Category</th>
              <th className="py-2.5">Price</th>
              <th className="py-2.5">Stock</th>
              <th className="py-2.5">Status</th>
              <th className="py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {visibleProducts.map((prod) => (
              <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                <td data-label="" className="py-3 flex items-center gap-3">
                  <img loading="lazy" decoding="async"
                    src={sizedImage(prod.thumbnail || prod.images[0], 120)}
                    alt=""
                    width={40}
                    height={48}
                    className="w-10 h-12 object-cover rounded-lg bg-neutral-100 shrink-0"
                  />
                  <div>
                    <p className="font-serif font-bold text-neutral-900">{prod.name}</p>
                    <p className="text-[11px] text-neutral-500">{prod.subcategory}</p>
                  </div>
                </td>
                <td data-label="SKU" className="py-3 font-mono text-neutral-600 whitespace-nowrap">{prod.sku}</td>
                <td data-label="Category" className="py-3 font-medium text-amber-900">{prod.categoryName}</td>
                <td data-label="Price" className="py-3 font-bold text-neutral-900">
                  {formatPrice(getEffectivePrice(prod))}
                  {isOnSale(prod) && (
                    <span className="text-[11px] text-neutral-500 line-through block">
                      {formatPrice(prod.regularPrice)}
                    </span>
                  )}
                </td>
                <td data-label="Stock" className="py-3">
                  <span
                    className={`font-semibold ${
                      prod.stock <= 0
                        ? 'text-rose-600'
                        : prod.stock <= prod.lowStockThreshold
                        ? 'text-amber-700'
                        : 'text-neutral-800'
                    }`}
                  >
                    {prod.stock} units
                  </span>
                </td>
                <td data-label="Status" className="py-3">
                  <StatusBadge status={prod.status} size="sm" />
                </td>
                <td data-label="" className="py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(prod)}
                      aria-label={`Edit ${prod.name}`}
                      title="Edit product"
                      className="inline-flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <ActionMenu
                      label={`More actions for ${prod.name}`}
                      items={[
                        ...(prod.status === 'active'
                          ? [
                              {
                                label: 'View in store',
                                icon: <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />,
                                onSelect: () => navigateToProduct(prod.id),
                              },
                            ]
                          : []),
                        {
                          label: 'Delete product',
                          icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
                          destructive: true,
                          onSelect: () =>
                            confirm({
                              title: 'Delete this product?',
                              message: `"${prod.name}" will be removed from the store. This cannot be undone.`,
                              confirmLabel: 'Delete Product',
                              onConfirm: () => deleteProduct(prod.id),
                            }),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleProducts.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-600">No products match your search.</p>
      )}
      {dialog}
    </AdminPanel>
  );
};
