# STEROSE

Single-vendor, multi-category e-commerce storefront with an admin portal, built with React, TypeScript, Vite and Tailwind CSS.

Store data lives in `src/data` and is persisted to the browser's `localStorage`. `server.ts` serves the app. Accepted orders get a 4 x 6 in parcel label from the admin order panel, built in `src/utils/parcelLabel.ts` and `src/services/parcelLabelOutput.ts`. All prices are whole Pakistani rupees, formatted by `src/services/currencyService.ts`.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`

## Scripts

- `npm run dev` - start the dev server on port 3000
- `npm run lint` - type-check the project
- `npm run build` - build to `dist`
- `npm run clean` - remove `dist`

## Project structure

```
server.ts          Dev/static server
public/            Official STEROSE logo, also used as the favicon
src/
  components/      admin, customer and shared (common) UI
  context/         StoreContext: app state and store actions
  data/            Seed data (replace with API calls when adding a backend)
  hooks/           Reusable React hooks, including URL hash routing
  pages/           Customer pages and the admin dashboard (admin/tabs)
  services/        Client API layer; storeApi.ts and imageStorage.ts hold the mock calls to swap for REST
  types/           Domain types
  utils/           Pure business helpers
```
