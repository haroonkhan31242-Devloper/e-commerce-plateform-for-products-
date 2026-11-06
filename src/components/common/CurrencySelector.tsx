import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { CURRENCIES, getCurrencyInfo } from '../../data/currencies.ts';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency, exchangeRates } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const normalizedQuery = query.trim().toLowerCase();
  const matches = CURRENCIES.filter(
    ({ code, name, symbol }) =>
      code.toLowerCase().includes(normalizedQuery) ||
      name.toLowerCase().includes(normalizedQuery) ||
      symbol.toLowerCase().includes(normalizedQuery)
  );

  const open = () => {
    setQuery('');
    setActiveIndex(Math.max(0, CURRENCIES.findIndex((c) => c.code === currency)));
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus();

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (e.key === 'Enter' && matches[activeIndex]) {
      e.preventDefault();
      setCurrency(matches[activeIndex].code);
      close();
    }
  };

  const selected = getCurrencyInfo(currency);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Display currency: ${selected.name}`}
        className="flex items-center gap-1.5 py-1 font-semibold text-neutral-100 hover:text-white"
      >
        <span>{selected.code}</span>
        <span className="text-amber-400">{selected.symbol}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white text-neutral-900 rounded-xl shadow-xl border border-neutral-200 overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="relative p-2 border-b border-neutral-100">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-label="Search currencies"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={matches[activeIndex] ? `${listId}-${matches[activeIndex].code}` : undefined}
              autoComplete="off"
              placeholder="Search currency"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              className="w-full pl-8 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" aria-label="Currencies" className="max-h-64 overflow-y-auto py-1">
            {matches.map((option, index) => {
              const isSelected = option.code === currency;
              return (
                <li
                  key={option.code}
                  id={`${listId}-${option.code}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    setCurrency(option.code);
                    close();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
                    index === activeIndex ? 'bg-neutral-100' : ''
                  }`}
                >
                  <span className="w-9 shrink-0 text-center text-sm font-semibold text-amber-800">{option.symbol}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold">{option.code}</span>
                    <span className="block text-xs text-neutral-600 truncate">{option.name}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>

          {matches.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-neutral-600">No currency matches your search.</p>
          )}

          <p className="px-3 py-2 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-600">
            {exchangeRates.source === 'mock'
              ? 'Demo exchange rates, not live market rates.'
              : `Exchange rates as of ${exchangeRates.asOf}.`}
          </p>
        </div>
      )}
    </div>
  );
};
