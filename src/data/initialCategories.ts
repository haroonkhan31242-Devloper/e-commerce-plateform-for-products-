import { Category } from '../types/index.ts';

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Healthcare Products',
    slug: 'healthcare',
    description: 'Clinical grade wellness, personal hygiene, vitamins, diagnostics & first-aid essentials.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    iconName: 'HeartPulse',
    subcategories: [
      'Personal Care',
      'Vitamins & Supplements',
      'Healthcare Essentials',
      'Diagnostics & Monitors',
      'First Aid & Recovery'
    ],
    displayOrder: 1,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-2',
    name: "Ladies' Fashion",
    slug: 'ladies-fashion',
    description: 'Designer couture, elegant dresses, silk blouses, tailored trousers, and festive luxury.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    iconName: 'Sparkles',
    subcategories: [
      'Dresses & Gowns',
      'Shirts & Blouses',
      'Trousers & Skirts',
      'Casual Wear',
      'Formal & Evening Wear',
      'Outerwear & Trench'
    ],
    displayOrder: 2,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-3',
    name: "Gents' Fashion",
    slug: 'gents-fashion',
    description: 'Precision Italian wool suits, oxford shirts, smart casuals, and luxury menswear.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    iconName: 'Shirt',
    subcategories: [
      'Oxford & Linen Shirts',
      'Suits & Blazers',
      'Chinos & Trousers',
      'Premium Casuals',
      'Winter Coats & Jackets'
    ],
    displayOrder: 3,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-4',
    name: 'Baby Garments',
    slug: 'baby-garments',
    description: '100% GOTS organic cotton rompers, cozy knitwear, swaddles, and gentle infant apparel.',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    iconName: 'Baby',
    subcategories: [
      'Organic Rompers & Onesies',
      'Toddler Sets',
      'Soft Knitted Cardigans',
      'Sleepwear & Swaddles',
      'Baby Accessories'
    ],
    displayOrder: 4,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-5',
    name: 'Cosmetics & Beauty',
    slug: 'cosmetics',
    description: 'Botanical serums, velvet matte lip pigments, illuminating foundations, and clean skincare.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    iconName: 'Palette',
    subcategories: [
      'Skincare & Serums',
      'Lipsticks & Glosses',
      'Foundations & Concealers',
      'Face Masques & Oils',
      'Beauty Tools & Accessories'
    ],
    displayOrder: 5,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-6',
    name: 'Artificial Jewelry',
    slug: 'artificial-jewelry',
    description: '18K gold-vermeil plated necklaces, zircon statement rings, chandelier earrings, and bridal sets.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    iconName: 'Gem',
    subcategories: [
      'Necklaces & Pendants',
      'Statement Rings',
      'Earrings & Studs',
      'Bracelets & Bangles',
      'Bridal & Jewelry Sets'
    ],
    displayOrder: 6,
    isActive: true,
    featured: true,
  },
  {
    id: 'cat-7',
    name: 'Luxury Fragrance & Living',
    slug: 'fragrance-living',
    description: 'Artisanal room elixirs, soy aromatherapy candles, and luxury home accents.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    iconName: 'Flame',
    subcategories: [
      'Artisan Perfumes',
      'Aromatherapy Candles',
      'Botanical Room Sprays'
    ],
    displayOrder: 7,
    isActive: true,
    featured: false,
  }
];
