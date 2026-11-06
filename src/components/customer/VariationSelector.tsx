import React from 'react';
import { Check } from 'lucide-react';
import { CartItemVariationChoice, Product } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { isLightColor } from '../../utils/product.ts';

interface VariationSelectorProps {
  product: Product;
  selected: CartItemVariationChoice[];
  onChange: (selected: CartItemVariationChoice[]) => void;
}

export const VariationSelector: React.FC<VariationSelectorProps> = ({ product, selected, onChange }) => {
  const { formatPrice } = useStore();

  const select = (variationName: string, chosenLabel: string, colorHex?: string) => {
    onChange(
      selected.map((item) =>
        item.variationName === variationName ? { ...item, chosenLabel, colorHex } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {product.variations.map((variation) => {
        const currentChoice = selected.find((v) => v.variationName === variation.name);

        return (
          <div key={variation.id} role="radiogroup" aria-label={variation.name} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-neutral-900 uppercase tracking-wider">{variation.name}</span>
              <span className="text-neutral-600 font-medium text-right">{currentChoice?.chosenLabel}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {variation.options.map((opt) => {
                const isSelected = currentChoice?.chosenLabel === opt.label;
                const isSoldOut = opt.stock <= 0;

                if (opt.colorHex) {
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={isSoldOut ? `${opt.label} (sold out)` : opt.label}
                      title={opt.label}
                      disabled={isSoldOut}
                      onClick={() => select(variation.name, opt.label, opt.colorHex)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center disabled:opacity-30 ${
                        isSelected
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: opt.colorHex }}
                    >
                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          className={`w-4 h-4 ${isLightColor(opt.colorHex) ? 'text-neutral-900' : 'text-white'}`}
                        />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isSoldOut}
                    onClick={() => select(variation.name, opt.label)}
                    className={`px-4 py-2.5 text-xs rounded-xl font-medium border disabled:opacity-40 disabled:line-through ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {opt.label}
                    {!!opt.priceAdjustment && (
                      <span className="opacity-75"> (+{formatPrice(opt.priceAdjustment)})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
