import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Category } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { Modal } from '../common/Overlay.tsx';
import { CategoryImagePicker } from './CategoryImagePicker.tsx';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { categories, addCategory, updateCategory, showToast } = useStore();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [newSubInput, setNewSubInput] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setDescription(categoryToEdit.description);
      setImage(categoryToEdit.image);
      setDisplayOrder(categoryToEdit.displayOrder);
      setIsActive(categoryToEdit.isActive);
      setSubcategories(categoryToEdit.subcategories || []);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');
      setDisplayOrder(1);
      setIsActive(true);
      setSubcategories(['Essentials', 'Luxury Collection']);
    }
  }, [categoryToEdit, isOpen]);

  const handleAddSubcategory = () => {
    if (!newSubInput.trim()) return;
    if (subcategories.includes(newSubInput.trim())) {
      showToast('error', 'Subcategory already exists.');
      return;
    }
    setSubcategories((prev) => [...prev, newSubInput.trim()]);
    setNewSubInput('');
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Category name is required.');
      return;
    }

    const calculatedSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (categories.some((c) => c.slug === calculatedSlug && c.id !== categoryToEdit?.id)) {
      showToast('error', 'Another category already uses this URL slug.');
      return;
    }

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        slug: calculatedSlug,
        description: description.trim(),
        image: image.trim(),
        displayOrder: Number(displayOrder),
        isActive,
        subcategories,
      });
    } else {
      addCategory({
        name: name.trim(),
        slug: calculatedSlug,
        description: description.trim(),
        image: image.trim(),
        iconName: 'Sparkles',
        subcategories,
        displayOrder: Number(displayOrder),
        isActive,
      });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={categoryToEdit ? 'Edit category' : 'Create category'} className="max-w-lg max-h-[92dvh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-neutral-900">
            {categoryToEdit ? 'Edit Department Category' : 'Create New Category'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 text-neutral-600 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label htmlFor="category-form-modal-field-1" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              id="category-form-modal-field-1"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!categoryToEdit) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              placeholder="e.g. Fine Home & Living"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="category-form-modal-field-2" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                URL Slug
              </label>
              <input
                id="category-form-modal-field-2"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. fine-home-living"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label htmlFor="category-form-modal-field-3" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                id="category-form-modal-field-3"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category-form-modal-field-4" className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              id="category-form-modal-field-4"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short headline for storefront cards"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
            />
          </div>

          <CategoryImagePicker image={image} onChange={setImage} />

          {/* Subcategories Editor */}
          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Subcategories ({subcategories.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Silk Scarves"
                value={newSubInput}
                onChange={(e) => setNewSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-neutral-50 rounded-xl border">
              {subcategories.map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-xs font-medium"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategory(idx)}
                    aria-label={`Remove ${sub}`}
                    className="p-0.5 text-neutral-500 hover:text-rose-700"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Active status toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 font-medium text-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-neutral-900"
              />
              <span>Activate Category in Customer Storefront Navigation</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800"
            >
              {categoryToEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
    </Modal>
  );
};
