import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { ActionMenu } from '../../../components/common/ActionMenu.tsx';

export const ReviewsTab: React.FC = () => {
  const { products, moderateReview, deleteReview } = useStore();
  const { confirm, dialog } = useConfirmDialog();

  const reviews = products.flatMap((p) =>
    p.reviews.map((r) => ({ ...r, productName: p.name, productId: p.id }))
  );

  return (
    <AdminPanel
      title="Reviews"
      description="Approve, hide, or remove customer reviews."
    >
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">No reviews submitted yet.</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-neutral-900">{rev.author}</span>
                  <span className="text-amber-700 font-bold">{rev.rating}/5</span>
                  <span className="text-neutral-500 text-xs">{rev.date}</span>
                {!rev.isApproved && (
                  <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-full">Hidden</span>
                )}
                </div>
                <p className="text-neutral-700 italic">&quot;{rev.comment}&quot;</p>
                <p className="text-[11px] text-amber-900 font-medium">Product: {rev.productName}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moderateReview(rev.productId, rev.id, !rev.isApproved)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs ${
                    rev.isApproved
                      ? 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {rev.isApproved ? (
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{rev.isApproved ? 'Hide' : 'Approve'}</span>
                </button>
                <ActionMenu
                  label={`More actions for review by ${rev.author}`}
                  items={[
                    {
                      label: 'Delete review',
                      icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,
                      destructive: true,
                      onSelect: () =>
                        confirm({
                          title: 'Delete this review?',
                          message: `The review by ${rev.author} will be permanently removed.`,
                          confirmLabel: 'Delete Review',
                          onConfirm: () => deleteReview(rev.productId, rev.id),
                        }),
                    },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {dialog}
    </AdminPanel>
  );
};
