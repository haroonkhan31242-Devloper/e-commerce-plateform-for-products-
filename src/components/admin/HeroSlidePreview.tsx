import React, { useState } from 'react';
import { ArrowRight, ImageOff, Sparkles } from 'lucide-react';
import { HeroSlide } from '../../types/index.ts';
import { sizedImage } from '../../utils/images.ts';

interface HeroSlidePreviewProps {
  slide: Pick<HeroSlide, 'image' | 'tag' | 'title' | 'ctaText'>;
  showText?: boolean;
}

// A small copy of the home page hero: same crop, brightness and gradient, so the admin
// sees the image as shoppers will
export const HeroSlidePreview: React.FC<HeroSlidePreviewProps> = ({ slide, showText = true }) => {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const hasImage = !!slide.image && failedImage !== slide.image;

  return (
    <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-neutral-950 text-white">
      {hasImage ? (
        <img
          src={sizedImage(slide.image, 800)}
          alt=""
          data-no-fallback
          onError={() => setFailedImage(slide.image)}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-400 text-[11px]">
          <ImageOff className="w-5 h-5" aria-hidden="true" />
          <span>{slide.image ? 'This image could not be loaded' : 'No image yet'}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/10" />

      {showText && (
        <div className="relative h-full flex flex-col justify-center gap-1.5 p-3 sm:p-4 max-w-[75%]">
          {slide.tag && (
            <span className="self-start inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-[9px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" aria-hidden="true" />
              <span className="truncate">{slide.tag}</span>
            </span>
          )}
          {slide.title && (
            <p className="font-serif text-sm sm:text-base font-bold leading-tight line-clamp-2">{slide.title}</p>
          )}
          {slide.ctaText && (
            <span className="self-start inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-white text-neutral-950 text-[9px] font-bold tracking-wider uppercase rounded-md">
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
