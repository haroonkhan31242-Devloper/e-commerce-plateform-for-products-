export interface AnalyzeImageParams {
  imageBase64: string;
  mimeType?: string;
}

export interface VisualSearchAnalysis {
  detectedCategory: string;
  itemSummary: string;
  aestheticStyle: string;
  dominantColors: string[];
  stylingAdvice: string;
  suggestedSearchKeywords: string[];
  productMatchCriteria?: {
    category: string;
    subcategories: string[];
    tags: string[];
  };
}

export interface AnalyzeImageResult {
  success: boolean;
  data?: VisualSearchAnalysis;
  modelUsed?: string;
  error?: string;
}

export const analyzeImageForVisualSearch = async (params: AnalyzeImageParams): Promise<AnalyzeImageResult> => {
  try {
    const res = await fetch('/api/gemini/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to analyze image.');
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred during visual image analysis.',
    };
  }
};
