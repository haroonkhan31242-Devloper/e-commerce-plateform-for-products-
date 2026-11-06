# STEROSE

Single-vendor, multi-category e-commerce storefront with an admin portal, built with React, TypeScript, Vite and Tailwind CSS.

Store data lives in `src/data` and is persisted to the browser's `localStorage`. `server.ts` serves the app and keeps the Gemini API key off the client for Visual Search; without a key, it uses built-in fallback results. Prices are stored in the base currency set in `src/data/storeSettings.ts` and converted for display by `src/services/currencyService.ts`, which uses demo exchange rates until a live rates API is connected.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Optional: set `GEMINI_API_KEY` in `.env` (see `.env.example`)
3. Start the app: `npm run dev`

## Scripts

- `npm run dev` - start the dev server on port 3000
- `npm run lint` - type-check the project
- `npm run build` - build to `dist`
- `npm run clean` - remove `dist`

## Project structure

```
server.ts          Dev/static server and Gemini proxy
src/
  components/      admin, customer and shared (common) UI
  context/         StoreContext: app state and store actions
  data/            Seed data (replace with API calls when adding a backend)
  hooks/           Reusable React hooks, including URL hash routing
  pages/           Customer pages and the admin dashboard (admin/tabs)
  services/        Client API layer; storeApi.ts, imageStorage.ts and currencyService.ts hold the mock calls to swap for REST
  types/           Domain types
  utils/           Pure business helpers
```
