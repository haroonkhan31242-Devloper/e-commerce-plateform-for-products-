import React, { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { ProductCard } from '../../components/customer/ProductCard.tsx';
import { StarRating } from '../../components/common/StarRating.tsx';
import { Reveal } from '../../components/common/Reveal.tsx';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation.ts';
import { sizedImage } from '../../utils/images.ts';

const HERO_SLIDES = [
  {
    tag: "Ladies' Haute Couture",
    title: 'Pure Mulberry Silk & Tailored Elegance',
    subtitle: 'Exquisite evening gowns, fluid drapery, and artisanal craftsmanship designed for unforgettable presence.',
    categorySlug: 'ladies-fashion',
    ctaText: 'Explore Couture',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
  },
  {
    tag: 'Clinical Healthcare & Diagnostics',
    title: 'Certified Medical Precision for Home Wellness',
    subtitle: 'Hospital-grade digital blood pressure monitors, liposomal vitamins, and first-aid essentials vetted by pharmacists.',
    categorySlug: 'healthcare',
    ctaText: 'Shop Healthcare',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=85',
  },
  {
    tag: 'Fine Artificial Jewelry',
    title: '18K Gold Vermeil & Brilliant 5A Zirconia',
    subtitle: 'Hand-set emerald pendants, chandelier drops, and bridal majesty with lasting anti-tarnish luster.',
    categorySlug: 'artificial-jewelry',
    ctaText: 'Discover Jewels',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85',
  },
  {
    tag: 'Botanical Cosmetics & Skincare',
    title: 'Colloidal Gold, Peptides & Velvet Pigments',
    subtitle: 'Clean biomimetic formulations and weightless matte lipsticks that enhance your natural radiance.',
    categorySlug: 'cosmetics',
    ctaText: 'Shop Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85',
  },
];

export const HomePage: React.FC = () => {
  const {
    products,
    categories,
    navigateToCategory,
    browseAllProducts,
  } = useStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const heroSwipe = useSwipeNavigation<HTMLElement>((direction) =>
    setActiveSlide((slide) => (slide + direction + HERO_SLIDES.length) % HERO_SLIDES.length)
  );

  const bestSellers = products.filter((p) => p.isBestSeller && p.status === 'active');
  const newArrivals = products.filter((p) => p.isNewArrival && p.status === 'active');

  const currentHero = HERO_SLIDES[activeSlide];

  return (
    <div className="space-y-14 sm:space-y-20 pb-16 sm:pb-24">
      {/* Hero Carousel Section */}
      <section
        ref={heroSwipe.ref}
        {...heroSwipe.pointerHandlers}
        className="relative overflow-hidden bg-neutral-950 text-white min-h-[520px] lg:min-h-[640px] flex items-center touch-pan-y"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <m.img
              key={currentHero.image}
              src={currentHero.image}
              srcSet={`${sizedImage(currentHero.image, 800)} 800w, ${currentHero.image} 1600w`}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/60 to-neutral-950/10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div key={activeSlide} className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentHero.tag}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              {currentHero.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl font-light">
              {currentHero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigateToCategory(currentHero.categorySlug)}
                className="px-8 py-3.5 bg-white text-neutral-950 hover:bg-amber-400 hover:text-neutral-950 text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-xl flex items-center gap-2 group"
              >
                <span>{currentHero.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.categorySlug}
              onClick={() => setActiveSlide(idx)}
              aria-label={`Show slide ${idx + 1}: ${slide.tag}`}
              aria-current={activeSlide === idx}
              className="py-3 px-1 group"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-8 bg-amber-400' : 'w-4 bg-white/40 group-hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Main Product Categories Showcase */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <p className="text-xs uppercase tracking-widest font-bold text-amber-900">
            Shop by Category
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
            Explore Our Collections
          </h2>
          <p className="text-sm text-neutral-600">
            From clinical health monitors and organic infant apparel to couture silks and zircon jewelry.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.filter((c) => c.isActive).map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigateToCategory(cat.slug)}
              className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-neutral-100 group-hover:border-amber-400 transition-colors">
                <img
                  src={sizedImage(cat.image, 200)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-amber-900 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-neutral-600 mt-1">
                {products.filter((p) => p.categoryId === cat.id && p.status === 'active').length} products
              </p>
            </button>
          ))}
        </div>
      </Reveal>

      {/* Best Sellers Grid */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-900">
              Customer Favorites
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Best-Selling Products
            </h2>
          </div>
          <button
            onClick={browseAllProducts}
            className="py-2 text-xs font-bold text-neutral-900 hover:text-amber-800 flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Reveal>

      {/* New Arrivals Grid */}
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-900">
              Just In
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={browseAllProducts}
            className="py-2 text-xs font-bold text-neutral-900 hover:text-amber-800 flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Reveal>

      {/* Customer Testimonials & Reviews */}
      <section className="bg-neutral-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <p className="text-xs uppercase tracking-widest font-bold text-amber-900">
              Customer Stories
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <StarRating rating={5} />
              <p className="text-sm text-neutral-700 leading-relaxed italic">
                &quot;The Mulberry silk gown was breathtaking. The weight and drape were extraordinary, and having certified healthcare essentials in the same checkout made shopping so convenient.&quot;
              </p>
              <div className="pt-2 border-t border-neutral-100">
                <p className="font-serif text-sm font-bold text-neutral-900">Vivienne LeClair</p>
                <p className="text-[11px] text-neutral-500">Verified Silk Apparel Purchase</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <StarRating rating={5} />
              <p className="text-sm text-neutral-700 leading-relaxed italic">
                &quot;As a physician, I checked the calibration of the STEROSE Pulse BP monitor against our clinic equipment. It passed with flying colors. A rare find in an aesthetic store.&quot;
              </p>
              <div className="pt-2 border-t border-neutral-100">
                <p className="font-serif text-sm font-bold text-neutral-900">Dr. Marcus Vance</p>
                <p className="text-[11px] text-neutral-500">Verified Healthcare Purchase</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <StarRating rating={5} />
              <p className="text-sm text-neutral-700 leading-relaxed italic">
                &quot;The 18K gold vermeil choker has that heavy, solid gold feel and incredible shine. It didn’t tarnish even after a weekend at an outdoor beach wedding.&quot;
              </p>
              <div className="pt-2 border-t border-neutral-100">
                <p className="font-serif text-sm font-bold text-neutral-900">Camilla Rossi</p>
                <p className="text-[11px] text-neutral-500">Verified Fine Jewelry Purchase</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
