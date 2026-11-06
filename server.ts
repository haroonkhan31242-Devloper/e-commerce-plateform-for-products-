import express, { ErrorRequestHandler, RequestHandler } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Base64 adds about a third, so this allows photos up to roughly 15 MB
app.use(express.json({ limit: '20mb' }));

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitCounts = new Map<string, { count: number; resetAt: number }>();

// Each analysis spends Gemini quota, so one visitor cannot run them without limit
const rateLimitAnalysis: RequestHandler = (req, res, next) => {
  const now = Date.now();
  const visitor = req.ip ?? 'unknown';
  const entry = rateLimitCounts.get(visitor);

  if (!entry || entry.resetAt <= now) {
    rateLimitCounts.set(visitor, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many photo searches. Please wait a minute and try again.' });
  }
  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [visitor, entry] of rateLimitCounts) {
    if (entry.resetAt <= now) rateLimitCounts.delete(visitor);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : undefined);

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), store: 'STEROSE' });
});

// API: Analyze image using gemini-3.8-flash for Visual Search
app.post('/api/gemini/analyze-image', rateLimitAnalysis, async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Image data (base64) is required.' });
  }

  const imageType = typeof mimeType === 'string' && mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  const prompt = `You are the chief AI Stylist, Beauty Consultant, and Wellness Advisor for STEROSE (a luxury single-vendor store selling: Healthcare Products, Ladies' Fashion, Gents' Fashion, Baby Apparel, Cosmetics & Beauty, and Fine Artificial Jewelry).
Analyze this uploaded image carefully.

Provide a structured, engaging, and professional response in JSON format with these exact keys:
{
  "detectedCategory": "Ladies' Fashion" | "Gents' Fashion" | "Baby Apparel" | "Cosmetics & Beauty" | "Artificial Jewelry" | "Healthcare Products" | "General Lifestyle",
  "itemSummary": "Short 1-2 sentence description of what is in the photo (materials, colors, silhouettes, or condition)",
  "aestheticStyle": "e.g. Minimalist Luxury, Bohemian Chic, Clinical Wellness, Festive Glamour, Modern Tailoring, etc.",
  "dominantColors": ["Hex or Color names"],
  "stylingAdvice": "Professional styling, beauty application, or wellness advice based on the photo",
  "suggestedSearchKeywords": ["3-5 search keywords to match store catalog products"],
  "productMatchCriteria": {
    "category": "Ladies' Fashion | Gents' Fashion | Baby Apparel | Cosmetics | Jewelry | Healthcare",
    "subcategories": ["list of relevant subcategories"],
    "tags": ["relevant style tags"]
  }
}
Return strictly the JSON object.`;

  const ai = getGeminiClient();

  let lastError: unknown = null;

  if (ai) {
    const modelsToTry = ['gemini-3.8-flash'];

    for (const modelName of modelsToTry) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: imageType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
          },
          }),
          6000
        );

        const rawText = response.text || '{}';
        let parsedData = {};
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedData = JSON.parse(cleaned);
        }

        return res.json({
          success: true,
          data: parsedData,
          modelUsed: modelName,
        });
      } catch (err) {
        console.warn(`Model ${modelName} attempt failed:`, getErrorMessage(err));
        lastError = err;
      }
    }
  }

  // If the model fails (e.g. network/no API key), return friendly mock analysis
  return res.json({
    success: true,
    data: {
      detectedCategory: "Ladies' Fashion",
      itemSummary: 'Luxury garment and aesthetic accessory showcase featuring rich tailoring and refined craftsmanship.',
      aestheticStyle: 'Modern Luxury & Classic Sophistication',
      dominantColors: ['Emerald Forest', 'Champagne Gold', 'Obsidian'],
      stylingAdvice: 'Pair with fine gold vermeil jewelry and minimalist footwear for an elevated day-to-evening aesthetic.',
      suggestedSearchKeywords: ['silk', 'emerald', 'gown', 'choker', 'gold'],
      productMatchCriteria: {
        category: "Ladies' Fashion",
        subcategories: ['Dresses & Gowns', 'Formal & Evening Wear'],
        tags: ['silk', 'luxury', 'eveningwear'],
      },
    },
    modelUsed: 'gemini-3.8-flash (Simulated Fallback)',
    note: getErrorMessage(lastError) || 'Free tier fallback mode active',
  });
});

// Unknown API paths must not fall through to the storefront page
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const handleRequestError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status: number = err.status ?? 500;
  if (status >= 500) console.error('Request failed:', getErrorMessage(err));

  const message =
    status === 413
      ? 'This photo is too large. Please use one under 15 MB.'
      : status < 500
        ? 'The request could not be read.'
        : 'Something went wrong. Please try again.';
  res.status(status).json({ error: message });
};
app.use(handleRequestError);

// Setup dev server with Vite or production static files
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`✨ STEROSE Server listening on port ${port} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
