import React from 'react';
import { Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { StatusBadge } from '../../../components/common/StatusBadge.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';
import { sizedImage } from '../../../utils/images.ts';
import { Category } from '../../../types/index.ts';

interface CategoriesTabProps {
  onEditCategory: (category: Category | null) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ onEditCategory }) => {
  const { categories, deleteCategory, navigateToCategory } = useStore();
  const { confirm, dialog } = useConfirmDialog();

  return (
    <AdminPanel
      title="Categories"
      description="Categories added here automatically populate storefront navigation and filter menus."
      actions={
        <button
          onClick={() => onEditCategory(null)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Category</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/50 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/9 bg-neutral-200 overflow-hidden relative">
                <img src={sizedImage(cat.image, 480)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900/80 text-white rounded text-[11px] font-bold">
                  Position {cat.displayOrder}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-sm text-neutral-900">
                    {cat.name}
                  </h3>
                  <StatusBadge status={cat.isActive ? 'active' : 'draft'} size="sm" />
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {cat.description}
                </p>

                <div className="pt-2">
                  <p className="text-[11px] uppercase font-bold text-neutral-500 mb-1">
                    Subcategories ({cat.subcategories.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.subcategories.map((sub, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-700 text-[11px] rounded"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 py-2 bg-white border-t border-neutral-200 flex justify-end gap-1">
              <button
                onClick={() => onEditCategory(cat)}
                aria-label={`Edit ${cat.name}`}
                title="Edit category"
                className="inline-flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" aria-hidden="true" />
              </button>
              <ActionMenu
                label={`More actions for ${cat.name}`}
                items={[
                  ...(cat.isActive
                    ? [
                        {
                          label: 'View in store',
                          icon: <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />,
                          onSelect: () => navigateToCategory(cat.slug),
                        },
                      ]
                    : []),
                  {
                    label: 'Delete category',
                    icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
                    destructive: true,
                    onSelect: () =>
                      confirm({
                        title: 'Delete this category?',
                        message: `"${cat.name}" will be removed from the store navigation.`,
                        confirmLabel: 'Delete Category',
                        onConfirm: () => deleteCategory(cat.id),
                      }),
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
      {dialog}
    </AdminPanel>
  );
};
