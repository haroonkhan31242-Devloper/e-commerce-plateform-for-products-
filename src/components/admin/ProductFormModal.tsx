import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Product, ProductVariation } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductImagePicker } from './ProductImagePicker.tsx';
import { Modal } from '../common/Overlay.tsx';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, products, addProduct, updateProduct, showToast } = useStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<string>('');
  const [stock, setStock] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');

  // Variations
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategoryId(productToEdit.categoryId);
      setSubcategory(productToEdit.subcategory);
      setRegularPrice(productToEdit.regularPrice);
      setSalePrice(productToEdit.salePrice ? String(productToEdit.salePrice) : '');
      setStock(productToEdit.stock);
      setLowStockThreshold(productToEdit.lowStockThreshold);
      setShortDescription(productToEdit.shortDescription);
      setDescription(productToEdit.description);
      setImages(productToEdit.images);
      setErrors({});
      setIsFeatured(productToEdit.isFeatured);
      setIsBestSeller(productToEdit.isBestSeller);
      setIsNewArrival(productToEdit.isNewArrival);
      setStatus(productToEdit.status);
      setVariations(productToEdit.variations || []);
    } else {
      const defaultCat = categories[0];
      setName('');
      setSku(`STR-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategoryId(defaultCat?.id || 'cat-1');
      setSubcategory(defaultCat?.subcategories[0] || 'General');
      setRegularPrice(120);
      setSalePrice('');
      setStock(20);
      setLowStockThreshold(5);
      setShortDescription('');
      setDescription('');
      setImages([]);
      setErrors({});
      setIsFeatured(false);
      setIsBestSeller(false);
      setIsNewArrival(true);
      setStatus('active');
      setVariations([]);
    }
  }, [productToEdit, isOpen, categories]);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const updateVariation = (index: number, updates: Partial<ProductVariation>) => {
    setVariations((prev) => prev.map((v, i) => (i === index ? { ...v, ...updates } : v)));
  };

  const updateOption = (
    variationIndex: number,
    optionIndex: number,
    updates: Partial<ProductVariation['options'][number]>
  ) => {
    const options = variations[variationIndex].options.map((option, i) =>
      i === optionIndex ? { ...option, ...updates } : option
    );
    updateVariation(variationIndex, { options });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const sale = salePrice ? Number(salePrice) : undefined;

    if (!name.trim()) nextErrors.name = 'Enter a product title.';
    if (!sku.trim()) {
      nextErrors.sku = 'Enter a SKU.';
    } else if (products.some((p) => p.sku === sku.trim() && p.id !== productToEdit?.id)) {
      nextErrors.sku = 'This SKU is already in use.';
    }
    if (!(regularPrice > 0)) nextErrors.regularPrice = 'Enter a price above zero.';
    if (sale !== undefined && (sale <= 0 || sale >= regularPrice)) {
      nextErrors.salePrice = 'Sale price must be between zero and the regular price.';
    }
    if (stock < 0) nextErrors.stock = 'Stock cannot be negative.';
    if (images.length === 0) nextErrors.images = 'Add at least one product image.';
    if (variations.some((v) => !v.name.trim() || v.options.length === 0 || v.options.some((o) => !o.label.trim()))) {
      nextErrors.variations = 'Each variation needs a name and at least one labeled option.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('error', 'Please fix the highlighted fields.');
      return;
    }

    const categoryObj = categories.find((c) => c.id === categoryId);
    const catName = categoryObj ? categoryObj.name : 'General';

    const payload = {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: sku.trim(),
      categoryId,
      categoryName: catName,
      subcategory,
      regularPrice: Number(regularPrice),
      salePrice: sale,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      images,
      thumbnail: images[0],
      shortDescription: shortDescription.trim() || name.trim(),
      description: description.trim() || shortDescription.trim() || name.trim(),
      specifications: productToEdit?.specifications ?? {
        Department: catName,
        Subcategory: subcategory,
        Stockkeeping: sku.trim(),
        Guarantee: 'Authenticity guaranteed',
      },
      variations,
      isFeatured,
      isBestSeller,
      isNewArrival,
      status,
      tags: productToEdit?.tags ?? [catName.toLowerCase(), subcategory.toLowerCase()],
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        label={productToEdit ? 'Edit product' : 'Add product'}
        className="max-w-4xl max-h-[92dvh] flex flex-col"
      >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                {productToEdit ? 'Edit Product & Inventory' : 'Add New Product to Catalog'}
              </h2>
              <p className="text-xs text-neutral-500">
                Details, pricing, variations, and photography.
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close product form"
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-full shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="product-form-modal-field-1" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    id="product-form-modal-field-1"
                    type="text"
                    value={name}
                    aria-invalid={!!errors.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Celestial 18K Gold Vermeil Drop Earrings"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                  {errors.name && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="product-form-modal-field-2" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      SKU Code *
                    </label>
                    <input
                      id="product-form-modal-field-2"
                      type="text"
                      value={sku}
                      aria-invalid={!!errors.sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    {errors.sku && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.sku}</p>}
                  </div>

                  <div>
                    <label htmlFor="product-form-modal-field-3" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      id="product-form-modal-field-3"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Product['status'])}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="product-form-modal-field-4" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      id="product-form-modal-field-4"
                      value={categoryId}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        setCategoryId(newCatId);
                        const c = categories.find((cat) => cat.id === newCatId);
                        if (c && c.subcategories.length > 0) {
                          setSubcategory(c.subcategories[0]);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="product-form-modal-field-5" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Subcategory
                    </label>
                    <select
                      id="product-form-modal-field-5"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white"
                    >
                      {(selectedCategoryObj?.subcategories || ['General']).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div>
                    <label htmlFor="product-form-modal-field-6" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Regular Price (PKR) *
                    </label>
                    <input
                      id="product-form-modal-field-6"
                      type="number"
                      min="0"
                      step="1"
                      value={regularPrice}
                      aria-invalid={!!errors.regularPrice}
                      onChange={(e) => setRegularPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.regularPrice && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.regularPrice}</p>}
                  </div>

                  <div>
                    <label htmlFor="product-form-modal-field-7" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Sale Price (PKR)
                    </label>
                    <input
                      id="product-form-modal-field-7"
                      type="number"
                      min="0"
                      step="1"
                      value={salePrice}
                      aria-invalid={!!errors.salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.salePrice && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.salePrice}</p>}
                  </div>

                  <div>
                    <label htmlFor="product-form-modal-field-8" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Stock Count *
                    </label>
                    <input
                      id="product-form-modal-field-8"
                      type="number"
                      min="0"
                      value={stock}
                      aria-invalid={!!errors.stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.stock && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.stock}</p>}
                  </div>

                  <div>
                    <label htmlFor="product-form-modal-field-9" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Low Alert At
                    </label>
                    <input
                      id="product-form-modal-field-9"
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="product-form-modal-field-10" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Short Description
                  </label>
                  <input
                    id="product-form-modal-field-10"
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-line headline"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label htmlFor="product-form-modal-field-11" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Description & Care Guide
                  </label>
                  <textarea
                    id="product-form-modal-field-11"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed craftsmanship, materials, clinical purity or usage directions..."
                    className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Photography, Variations & Badges */}
              <div className="space-y-5">
                <ProductImagePicker
                  key={isOpen ? productToEdit?.id ?? 'new' : 'closed'}
                  images={images}
                  onChange={setImages}
                  error={errors.images}
                />

                {/* Variations Editor */}
                <div className="pt-3 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Variations</p>
                    <button
                      type="button"
                      onClick={() =>
                        setVariations((prev) => [
                          ...prev,
                          { id: `var-${Date.now()}`, name: '', options: [{ label: '', value: '', stock: stock }] },
                        ])
                      }
                      className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add Variation</span>
                    </button>
                  </div>

                  {variations.map((variation, vIndex) => (
                    <div key={variation.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label="Variation name"
                          placeholder="Name, e.g. Size"
                          value={variation.name}
                          onChange={(e) => updateVariation(vIndex, { name: e.target.value })}
                          className="flex-1 min-w-0 px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setVariations((prev) => prev.filter((_, i) => i !== vIndex))}
                          aria-label={`Remove variation ${variation.name}`}
                          className="p-2 text-neutral-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {variation.options.map((option, oIndex) => (
                        <div key={oIndex} className="grid grid-cols-[1fr_4rem_4.5rem_auto] gap-1.5 items-center">
                          <input
                            type="text"
                            aria-label="Option label"
                            placeholder="Option"
                            value={option.label}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, {
                                label: e.target.value,
                                value: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                              })
                            }
                            className="min-w-0 px-2 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          />
                          <input
                            type="number"
                            min="0"
                            aria-label="Option stock"
                            title="Stock"
                            value={option.stock}
                            onChange={(e) => updateOption(vIndex, oIndex, { stock: Number(e.target.value) })}
                            className="min-w-0 px-2 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            aria-label="Option extra price"
                            title="Extra price"
                            placeholder="+ Price"
                            value={option.priceAdjustment ?? ''}
                            onChange={(e) =>
                              updateOption(vIndex, oIndex, {
                                priceAdjustment: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="min-w-0 px-2 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateVariation(vIndex, { options: variation.options.filter((_, i) => i !== oIndex) })
                            }
                            aria-label={`Remove option ${option.label}`}
                            className="p-1.5 text-neutral-500 hover:text-rose-700"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          updateVariation(vIndex, {
                            options: [...variation.options, { label: '', value: '', stock: 0 }],
                          })
                        }
                        className="text-xs font-semibold text-neutral-700 hover:text-neutral-900"
                      >
                        + Add option
                      </button>
                    </div>
                  ))}
                  {errors.variations && <p role="alert" className="text-xs text-rose-700">{errors.variations}</p>}
                </div>

                {/* Badges Toggles */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <p className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">Merchandising</p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                      />
                      <span>Featured product</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                      />
                      <span>Best seller</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                      />
                      <span>New arrival</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="pt-6 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
              >
                {productToEdit ? 'Save Changes' : 'Publish Product'}
              </button>
            </div>
          </form>
      </Modal>

    </>
  );
};
