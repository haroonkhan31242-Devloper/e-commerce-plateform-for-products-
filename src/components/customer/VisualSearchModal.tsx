import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  Loader2,
  ShoppingBag,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { Modal } from '../common/Overlay.tsx';
import { analyzeImageForVisualSearch, VisualSearchAnalysis } from '../../services/geminiService.ts';
import { Product } from '../../types/index.ts';
import { getEffectivePrice } from '../../utils/product.ts';

const SAMPLE_PREVIEWS = [
  {
    title: 'Emerald Silk Dress',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
    category: "Ladies' Fashion",
  },
  {
    title: 'Gold Choker Jewelry',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    category: 'Artificial Jewelry',
  },
  {
    title: 'Skincare Elixir Serum',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    category: 'Cosmetics & Beauty',
  },
  {
    title: 'Digital Health Monitor',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    category: 'Healthcare Products',
  },
];

export const VisualSearchModal: React.FC = () => {
  const {
    isVisualSearchModalOpen,
    setIsVisualSearchModalOpen,
    products,
    formatPrice,
    navigateToProduct,
    openQuickView,
    showToast,
  } = useStore();

  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisualSearchAnalysis | null>(null);
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSampleResult, setIsSampleResult] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please upload an image file (PNG, JPEG, WebP).');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImageBase64(result);
      setImagePreviewUrl(result);
      setAnalysisResult(null);
      setMatchingProducts([]);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_PREVIEWS[0]) => {
    try {
      setIsAnalyzing(true);
      setImagePreviewUrl(sample.url);
      setErrorMessage(null);

      // Fetch sample and convert to base64
      const response = await fetch(sample.url);
      if (!response.ok) throw new Error(`Sample image returned ${response.status}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setSelectedImageBase64(base64data);
        setMimeType('image/jpeg');
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Sample image failed to load', error);
      setIsAnalyzing(false);
      setImagePreviewUrl(null);
      showToast('error', 'That sample could not be loaded. Please try another image.');
    }
  };

  const runVisualAnalysis = async () => {
    if (!selectedImageBase64) {
      showToast('error', 'Please upload or select an image first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    const result = await analyzeImageForVisualSearch({
      imageBase64: selectedImageBase64,
      mimeType,
    });

    setIsAnalyzing(false);

    if (!result.success || !result.data) {
      setErrorMessage(result.error || 'We could not analyze this photo. Please try again.');
      return;
    }

    const data = result.data;
    const isSample = !!result.modelUsed?.includes('Simulated');
    setAnalysisResult(data);
    setIsSampleResult(isSample);

    // Find best matching products in store catalog based on Gemini analysis
    const keywords = (data.suggestedSearchKeywords || []).map((k) => k.toLowerCase());
    const detectedCat = (data.detectedCategory || '').toLowerCase();

    const matches = products.filter((prod) => {
      const prodText = `${prod.name} ${prod.categoryName} ${prod.subcategory} ${prod.description} ${prod.tags.join(' ')}`.toLowerCase();
      // Match by category
      const catMatch = detectedCat && (prod.categoryName.toLowerCase().includes(detectedCat) || detectedCat.includes(prod.categoryName.toLowerCase()));
      // Match by keyword
      const keywordMatch = keywords.some((k) => prodText.includes(k));
      return catMatch || keywordMatch;
    });

    // If no direct matches, show related category products
    if (matches.length > 0) {
      setMatchingProducts(matches.slice(0, 4));
    } else {
      setMatchingProducts(products.slice(0, 3));
    }

    showToast(
      isSample ? 'info' : 'success',
      isSample ? 'Showing sample suggestions. Photo analysis is not connected.' : 'Analysis complete.'
    );
  };

  const handleReset = () => {
    setSelectedImageBase64(null);
    setImagePreviewUrl(null);
    setAnalysisResult(null);
    setMatchingProducts([]);
    setErrorMessage(null);
  };

  return (
    <Modal isOpen={isVisualSearchModalOpen} onClose={() => setIsVisualSearchModalOpen(false)} label="Visual search" className="max-w-4xl max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-amber-400 rounded-xl shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
                  Search by Photo
                </h3>
              </div>
              <p className="text-xs text-neutral-500">
                Upload a photo to find matching products and styling advice.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVisualSearchModalOpen(false)}
            aria-label="Close photo search"
            className="p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!imagePreviewUrl ? (
            /* Upload Screen */
            <div className="space-y-6">
              <div
                role="button"
                tabIndex={0}
                aria-label="Choose an image to analyze"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-neutral-50/50 hover:bg-neutral-50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-full bg-white shadow-md border border-neutral-200 mx-auto flex items-center justify-center text-neutral-700 group-hover:scale-110 transition-transform mb-4">
                  <UploadCloud className="w-8 h-8 text-amber-700" />
                </div>
                <h4 className="font-serif text-base font-bold text-neutral-900 mb-1">
                  Upload an image to analyze
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Choose a photo from your device. PNG, JPEG, and WebP are supported.
                </p>
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                </span>
              </div>

              {/* Sample Images Section */}
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Or try a sample:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_PREVIEWS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      className="group rounded-xl border border-neutral-200 overflow-hidden bg-white hover:border-neutral-900 hover:shadow-md transition-all text-left"
                    >
                      <div className="aspect-square bg-neutral-100 overflow-hidden">
                        <img loading="lazy" decoding="async"
                          src={sample.url}
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {sample.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">{sample.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Selected Image & Analysis View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Photo Preview Panel */}
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 flex flex-col items-center">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-neutral-200 mb-3 shadow-inner">
                    <img loading="lazy" decoding="async"
                      src={imagePreviewUrl}
                      alt="Uploaded query"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2 px-3 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>New Photo</span>
                    </button>
                    {!analysisResult && (
                      <button
                        onClick={runVisualAnalysis}
                        disabled={isAnalyzing}
                        className="flex-1 py-2 px-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Analyze</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Analysis Report Panel */}
                <div className="md:col-span-2 space-y-4">
                  {isAnalyzing && (
                    <div className="p-8 border border-neutral-200 rounded-2xl bg-neutral-50/70 text-center flex flex-col items-center justify-center min-h-[240px]">
                      <Loader2 className="w-8 h-8 text-neutral-900 animate-spin mb-3" />
                      <h4 className="font-serif text-base font-bold text-neutral-900 mb-1">
                        Analyzing your photo...
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-sm">
                        Looking at style, color, and materials, then checking our catalog.
                      </p>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-2">
                      <p className="font-semibold">Analysis failed</p>
                      <p>{errorMessage}</p>
                      <button
                        onClick={runVisualAnalysis}
                        className="px-3 py-1.5 bg-rose-800 text-white font-semibold rounded-lg text-xs"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  )}

                  {!isAnalyzing && !analysisResult && !errorMessage && (
                    <div className="p-6 border border-neutral-200 rounded-2xl bg-amber-50/40 text-left space-y-3">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        <span>Ready to analyze</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        We will identify the style, colors, and materials, then find similar products in our store.
                      </p>
                      <button
                        onClick={runVisualAnalysis}
                        className="py-2.5 px-5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Analyze Photo</span>
                      </button>
                    </div>
                  )}

                  {analysisResult && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {isSampleResult && (
                        <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                          These are sample suggestions, not an analysis of your photo. Photo analysis is not connected yet.
                        </p>
                      )}
                      {/* Breakdown Card */}
                      <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                          <span className="text-xs font-bold uppercase text-amber-900">
                            Category: {analysisResult.detectedCategory}
                          </span>
                          <span className="text-xs font-semibold text-neutral-600 px-2.5 py-0.5 bg-white border border-neutral-200 rounded-full">
                            Style: {analysisResult.aestheticStyle}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-neutral-900 mb-1">
                            Visual Summary:
                          </p>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {analysisResult.itemSummary}
                          </p>
                        </div>

                        {/* Dominant Colors */}
                        {analysisResult.dominantColors && analysisResult.dominantColors.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1">
                              <Palette className="w-3 h-3 text-neutral-500" />
                              <span>Detected Palette:</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.dominantColors.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md text-xs font-medium text-neutral-800"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Styling / Expert Advice */}
                        <div className="pt-2 border-t border-neutral-200">
                          <p className="text-xs font-semibold text-neutral-900 mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Stylist & Expert Recommendation:</span>
                          </p>
                          <p className="text-xs text-neutral-700 leading-relaxed bg-white p-3 rounded-xl border border-neutral-200/80">
                            {analysisResult.stylingAdvice}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Matching Catalog Products */}
              {matchingProducts.length > 0 && (
                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-700" />
                      <span>Matching Products in Store Catalog</span>
                    </h4>
                    <span className="text-xs text-neutral-500">
                      {matchingProducts.length} suggestions found
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {matchingProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsVisualSearchModalOpen(false);
                          navigateToProduct(prod.id);
                        }}
                        className="group border border-neutral-200 rounded-xl overflow-hidden bg-white hover:border-neutral-900 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                          <img loading="lazy" decoding="async"
                            src={prod.thumbnail || prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-2 left-2 text-[11px] font-semibold px-2 py-0.5 bg-neutral-900/80 text-white rounded">
                            {formatPrice(getEffectivePrice(prod))}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-[11px] uppercase font-bold text-amber-900 truncate">
                            {prod.subcategory}
                          </p>
                          <h5 className="font-serif text-xs font-semibold text-neutral-900 line-clamp-1 group-hover:text-amber-900">
                            {prod.name}
                          </h5>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsVisualSearchModalOpen(false);
                              openQuickView(prod);
                            }}
                            className="mt-2 w-full py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded transition-colors text-center"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
          <span>Photos are used only for this search.</span>
          <button
            onClick={() => setIsVisualSearchModalOpen(false)}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-medium"
          >
            Close
          </button>
        </div>
    </Modal>
  );
};
