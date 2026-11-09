import { HeroSlide } from '../types/index.ts';

// The slides the home page shipped with; the admin Hero Slider section manages them from here on
export const initialHeroSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
    tag: "Ladies' Haute Couture",
    title: 'Pure Mulberry Silk & Tailored Elegance',
    subtitle: 'Exquisite evening gowns, fluid drapery, and artisanal craftsmanship designed for unforgettable presence.',
    ctaText: 'Explore Couture',
    categorySlug: 'ladies-fashion',
    isActive: true,
  },
  {
    id: 'hero-2',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=85',
    tag: 'Clinical Healthcare & Diagnostics',
    title: 'Certified Medical Precision for Home Wellness',
    subtitle: 'Hospital-grade digital blood pressure monitors, liposomal vitamins, and first-aid essentials vetted by pharmacists.',
    ctaText: 'Shop Healthcare',
    categorySlug: 'healthcare',
    isActive: true,
  },
  {
    id: 'hero-3',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85',
    tag: 'Fine Artificial Jewelry',
    title: '18K Gold Vermeil & Brilliant 5A Zirconia',
    subtitle: 'Hand-set emerald pendants, chandelier drops, and bridal majesty with lasting anti-tarnish luster.',
    ctaText: 'Discover Jewels',
    categorySlug: 'artificial-jewelry',
    isActive: true,
  },
  {
    id: 'hero-4',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85',
    tag: 'Botanical Cosmetics & Skincare',
    title: 'Colloidal Gold, Peptides & Velvet Pigments',
    subtitle: 'Clean biomimetic formulations and weightless matte lipsticks that enhance your natural radiance.',
    ctaText: 'Shop Beauty',
    categorySlug: 'cosmetics',
    isActive: true,
  },
];
