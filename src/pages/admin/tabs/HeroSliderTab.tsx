import React from 'react';
import { ChevronDown, ChevronUp, Edit2, Eye, EyeOff, Images, Plus, Trash2 } from 'lucide-react';
import { AdminPanel } from '../../../components/admin/AdminPanel.tsx';
import { HeroSlidePreview } from '../../../components/admin/HeroSlidePreview.tsx';
import { useConfirmDialog } from '../../../components/common/ConfirmDialog.tsx';
import { useStore } from '../../../context/StoreContext.tsx';
import { HeroSlide } from '../../../types/index.ts';

interface HeroSliderTabProps {
  onEditSlide: (slide: HeroSlide | null) => void;
}

const iconButton =
  'inline-flex items-center justify-center w-9 h-9 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent';

export const HeroSliderTab: React.FC<HeroSliderTabProps> = ({ onEditSlide }) => {
  const { heroSlides, categories, moveHeroSlide, setHeroSlideActive, deleteHeroSlide } = useStore();
  const { confirm, dialog } = useConfirmDialog();
  const visibleCount = heroSlides.filter((slide) => slide.isActive).length;

  const linkLabel = (slug: string) =>
    slug ? categories.find((c) => c.slug === slug)?.name ?? 'A removed category' : 'All Products';

  return (
    <AdminPanel
      title="Hero Slider"
      description="The large images at the top of the home page, shown in this order. Changes go live as soon as they are saved."
      actions={
        <button
          onClick={() => onEditSlide(null)}
          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Slide</span>
        </button>
      }
    >
      {heroSlides.length > 0 && visibleCount === 0 && (
        <p className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          Every slide is hidden, so the home page shows a plain welcome banner instead.
        </p>
      )}

      {heroSlides.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <Images className="w-8 h-8 mx-auto text-neutral-400" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-900">No slides yet</p>
          <p className="text-xs text-neutral-500">The home page shows a plain welcome banner until you add one.</p>
          <button
            onClick={() => onEditSlide(null)}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
          >
            Add the First Slide
          </button>
        </div>
      ) : (
        <ol className="space-y-3">
          {heroSlides.map((slide, index) => (
            <li
              key={slide.id}
              className={`p-3 border border-neutral-200 rounded-2xl bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center gap-3 ${
                slide.isActive ? '' : 'opacity-70'
              }`}
            >
              <div className="w-full sm:w-56 shrink-0">
                <HeroSlidePreview slide={slide} showText={false} />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase">Slide {index + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      slide.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {slide.isActive ? 'Showing' : 'Hidden'}
                  </span>
                </div>
                <p className="font-serif font-bold text-sm text-neutral-900 truncate">
                  {slide.title || <span className="text-neutral-500 font-sans font-normal italic">No heading</span>}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {slide.ctaText ? `Button "${slide.ctaText}" opens ${linkLabel(slide.categorySlug)}` : 'No button'}
                </p>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                <button
                  onClick={() => moveHeroSlide(slide.id, -1)}
                  disabled={index === 0}
                  aria-label={`Move slide ${index + 1} up`}
                  title="Move up"
                  className={iconButton}
                >
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => moveHeroSlide(slide.id, 1)}
                  disabled={index === heroSlides.length - 1}
                  aria-label={`Move slide ${index + 1} down`}
                  title="Move down"
                  className={iconButton}
                >
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setHeroSlideActive(slide.id, !slide.isActive)}
                  aria-label={`${slide.isActive ? 'Hide' : 'Show'} slide ${index + 1}`}
                  aria-pressed={slide.isActive}
                  title={slide.isActive ? 'Hide from home page' : 'Show on home page'}
                  className={iconButton}
                >
                  {slide.isActive ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
                </button>
                <button onClick={() => onEditSlide(slide)} aria-label={`Edit slide ${index + 1}`} title="Edit or replace image" className={iconButton}>
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() =>
                    confirm({
                      title: 'Delete this slide?',
                      message: 'It will be removed from the home page slider.',
                      confirmLabel: 'Delete Slide',
                      onConfirm: () => deleteHeroSlide(slide.id),
                    })
                  }
                  aria-label={`Delete slide ${index + 1}`}
                  title="Delete slide"
                  className={`${iconButton} hover:text-rose-700 hover:bg-rose-50`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {dialog}
    </AdminPanel>
  );
};
