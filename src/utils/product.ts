import { CartItemVariationChoice, Category, Product, ProductVariation, Review } from '../types/index.ts';

// Shoppers only see active products, and a hidden category hides everything in it
export const isOnStorefront = (product: Product, categories: Category[]): boolean =>
  product.status === 'active' && categories.find((c) => c.id === product.categoryId)?.isActive !== false;

type PricedProduct = Pick<Product, 'regularPrice' | 'salePrice'>;

export const getEffectivePrice = (product: PricedProduct): number =>
  product.salePrice ?? product.regularPrice;

export const isOnSale = (product: PricedProduct): boolean =>
  !!product.salePrice && product.salePrice < product.regularPrice;

export const getDiscountPercent = (product: PricedProduct): number =>
  isOnSale(product)
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;

const findOption = (product: Product, choice: CartItemVariationChoice) =>
  product.variations
    .find((v) => v.name === choice.variationName)
    ?.options.find((o) => o.label === choice.chosenLabel);

export const getDefaultVariationChoices = (product: Product): CartItemVariationChoice[] =>
  product.variations.map((variation) => {
    const option = variation.options.find((o) => o.stock > 0) ?? variation.options[0];
    return {
      variationName: variation.name,
      chosenLabel: option?.label ?? '',
      colorHex: option?.colorHex,
    };
  });

// Sale or regular price plus any surcharge from the chosen options
export const getUnitPrice = (product: Product, choices: CartItemVariationChoice[]): number =>
  choices.reduce(
    (price, choice) => price + (findOption(product, choice)?.priceAdjustment ?? 0),
    getEffectivePrice(product)
  );

// Units available for this exact combination of options
export const getAvailableStock = (product: Product, choices: CartItemVariationChoice[]): number =>
  choices.reduce(
    (available, choice) => Math.min(available, findOption(product, choice)?.stock ?? available),
    product.stock
  );

// With options, a product can only sell as many units as its smallest variation holds
export const getVariationStock = (variations: ProductVariation[]): number =>
  Math.min(...variations.map((v) => v.options.reduce((sum, option) => sum + option.stock, 0)));

// Applies a stock change to the product and to each chosen option
export const changeStock = (
  product: Product,
  choices: CartItemVariationChoice[],
  delta: number
): Product => ({
  ...product,
  stock: Math.max(0, product.stock + delta),
  variations: product.variations.map((variation) => ({
    ...variation,
    options: variation.options.map((option) =>
      choices.some((c) => c.variationName === variation.name && c.chosenLabel === option.label)
        ? { ...option, stock: Math.max(0, option.stock + delta) }
        : option
    ),
  })),
});

export const isLightColor = (hex: string): boolean => {
  const value = parseInt(hex.replace('#', ''), 16);
  const luminance = 0.299 * (value >> 16) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255);
  return luminance > 170;
};

// 0 means no published reviews yet, which the storefront shows as unrated
export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return Number(average.toFixed(1));
};
