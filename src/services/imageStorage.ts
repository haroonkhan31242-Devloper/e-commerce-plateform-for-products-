// Client-side contract for product image storage. Uploads resolve to a URL string, which is
// all a product stores, so a future POST /api/uploads/products leaves every caller unchanged.

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const URL_CHECK_TIMEOUT_MS = 8000;

export const MAX_PRODUCT_IMAGES = 8;
export const IMAGE_FILE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',');
export const IMAGE_FILE_HINT = `JPG, PNG, or WebP, up to 5 MB each. Maximum ${MAX_PRODUCT_IMAGES} images.`;

export const validateImageFile = (file: File): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name} is not a supported format. Use JPG, PNG, or WebP.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name} is larger than 5 MB.`;
  }
  return null;
};

// Scales the image down because uploads live in browser storage until a backend exists
export const uploadProductImage = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = canvas.toDataURL('image/webp', 0.82);
  return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.82);
};

const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Resolves to an error message, or null when the URL points at a loadable image
export const validateImageUrl = (url: string): Promise<string | null> => {
  if (!isHttpUrl(url)) {
    return Promise.resolve('Enter a full image link starting with http:// or https://.');
  }

  return new Promise((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(() => {
      image.src = '';
      resolve('This link took too long to load. Check it and try again.');
    }, URL_CHECK_TIMEOUT_MS);

    image.onload = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      resolve('No image could be loaded from this link.');
    };
    image.src = url;
  });
};
