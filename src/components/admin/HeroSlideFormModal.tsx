import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { HeroSlide } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { Modal } from '../common/Overlay.tsx';
import { CategoryImagePicker } from './CategoryImagePicker.tsx';
import { HeroSlidePreview } from './HeroSlidePreview.tsx';
import { validateImageUrl } from '../../services/imageStorage.ts';

interface HeroSlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideToEdit?: HeroSlide | null;
}

const EMPTY_SLIDE: Omit<HeroSlide, 'id'> = {
  image: '',
  tag: '',
  title: '',
  subtitle: '',
  ctaText: 'Shop Now',
  categorySlug: '',
  isActive: true,
};

const inputClasses = 'w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900';
const labelClasses = 'block font-bold text-neutral-700 uppercase tracking-wider mb-1';

export const HeroSlideFormModal: React.FC<HeroSlideFormModalProps> = ({ isOpen, onClose, slideToEdit }) => {
  const { heroSlides, categories, saveHeroSlide } = useStore();
  const [form, setForm] = useState(EMPTY_SLIDE);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(slideToEdit ? { ...slideToEdit } : EMPTY_SLIDE);
    setError(null);
  }, [slideToEdit, isOpen]);

  const update = (changes: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...changes }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const image = form.image.trim();

    if (!image) {
      setError('Add an image from your device or paste an image link.');
      return;
    }
    if (heroSlides.some((slide) => slide.image === image && slide.id !== slideToEdit?.id)) {
      setError('This image is already used by another slide.');
      return;
    }

    // Uploaded images are already checked; a pasted link has to actually load
    if (!image.startsWith('data:image/')) {
      setIsChecking(true);
      const problem = await validateImageUrl(image);
      setIsChecking(false);
      if (problem) {
        setError(problem);
        return;
      }
    }

    saveHeroSlide({
      ...form,
      id: slideToEdit?.id,
      image,
      tag: form.tag.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      ctaText: form.ctaText.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label={slideToEdit ? 'Edit hero slide' : 'Add hero slide'}
      className="max-w-lg max-h-[92dvh] overflow-y-auto"
    >
      <div className="p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-neutral-900">
          {slideToEdit ? 'Edit Hero Slide' : 'Add Hero Slide'}
        </h2>
        <button onClick={onClose} aria-label="Close" className="p-2 text-neutral-600 hover:text-neutral-900">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 text-xs">
        <CategoryImagePicker
          label="Slide Image *"
          image={form.image}
          showPreview={false}
          onChange={(image) => {
            update({ image });
            setError(null);
          }}
        />

        <div className="space-y-1">
          <p className={labelClasses}>Preview</p>
          <HeroSlidePreview slide={form} />
          <p className="text-neutral-500">Shown with the same crop, darkening and text style as the home page.</p>
        </div>

        <div>
          <label htmlFor="hero-slide-tag" className={labelClasses}>Small Label</label>
          <input id="hero-slide-tag" type="text" value={form.tag} onChange={(e) => update({ tag: e.target.value })} placeholder="e.g. Ladies' Haute Couture" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="hero-slide-title" className={labelClasses}>Heading</label>
          <input id="hero-slide-title" type="text" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Pure Mulberry Silk & Tailored Elegance" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="hero-slide-subtitle" className={labelClasses}>Description</label>
          <textarea id="hero-slide-subtitle" rows={2} value={form.subtitle} onChange={(e) => update({ subtitle: e.target.value })} className={`${inputClasses} resize-none`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="hero-slide-cta" className={labelClasses}>Button Text</label>
            <input id="hero-slide-cta" type="text" value={form.ctaText} onChange={(e) => update({ ctaText: e.target.value })} placeholder="Leave empty for no button" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="hero-slide-link" className={labelClasses}>Button Opens</label>
            <select id="hero-slide-link" value={form.categorySlug} onChange={(e) => update({ categorySlug: e.target.value })} className={`${inputClasses} bg-white`}>
              <option value="">All Products</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}{category.isActive ? '' : ' (hidden)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 font-medium text-neutral-800 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update({ isActive: e.target.checked })} className="w-4 h-4 rounded" />
          <span>Show this slide on the home page</span>
        </label>

        {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}

        <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-300 text-neutral-700 font-semibold rounded-xl">
            Cancel
          </button>
          <button type="submit" disabled={isChecking} className="px-5 py-2 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-60">
            {isChecking ? 'Checking image...' : slideToEdit ? 'Save Changes' : 'Add Slide'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
