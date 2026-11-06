// Catalog photos come from a CDN that resizes through the `w` query parameter. Requesting
// the size actually displayed keeps pages light on mobile data. Other URLs pass through.
export const sizedImage = (url: string, width: number): string =>
  url.startsWith('https://images.unsplash.com/') ? url.replace(/([?&]w=)\d+/, `$1${width}`) : url;
