import React, { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, RefreshCw, Star, Trash2 } from 'lucide-react';
import {
  IMAGE_FILE_ACCEPT,
  IMAGE_FILE_HINT,
  MAX_PRODUCT_IMAGES,
  uploadProductImage,
  validateImageFile,
  validateImageUrl,
} from '../../services/imageStorage.ts';

type ImageSource = 'gallery' | 'url';

const SOURCE_TABS: { id: ImageSource; label: string; icon: React.ReactNode }[] = [
  { id: 'gallery', label: 'Upload from Gallery', icon: <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'url', label: 'Image URL', icon: <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> },
];

interface ProductImagePickerProps {
  images: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  error?: string;
}

export const ProductImagePicker: React.FC<ProductImagePickerProps> = ({ images, onChange, error }) => {
  const [source, setSource] = useState<ImageSource>('gallery');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  const remainingSlots = MAX_PRODUCT_IMAGES - images.length;

  const addFiles = async (files: File[]) => {
    const problems: string[] = [];
    const validFiles = files.filter((file) => {
      const problem = validateImageFile(file);
      if (problem) problems.push(problem);
      return !problem;
    });

    if (validFiles.length > remainingSlots) {
      problems.push(`Only ${remainingSlots} more image(s) can be added. A product can have ${MAX_PRODUCT_IMAGES}.`);
    }

    setIsUploading(true);
    const uploads = await Promise.allSettled(validFiles.slice(0, remainingSlots).map(uploadProductImage));
    setIsUploading(false);

    const urls = uploads.flatMap((result, index) => {
      if (result.status === 'fulfilled') return [result.value];
      problems.push(`${validFiles[index].name} could not be read. It may be damaged.`);
      return [];
    });

    onChange((prev) => [...prev, ...urls]);
    setMessages(problems);
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = replaceIndexRef.current;
    e.target.value = '';
    if (!file || index === null) return;

    const problem = validateImageFile(file);
    if (problem) {
      setMessages([problem]);
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadProductImage(file);
      onChange((prev) => prev.map((image, i) => (i === index ? url : image)));
      setMessages([]);
    } catch (error) {
      console.error('Image replacement failed', error);
      setMessages([`${file.name} could not be read. It may be damaged.`]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url) {
      setMessages(['Paste an image link first.']);
      return;
    }
    if (images.includes(url)) {
      setMessages(['This image has already been added.']);
      return;
    }
    if (remainingSlots <= 0) {
      setMessages([`A product can have ${MAX_PRODUCT_IMAGES} images. Remove one to add another.`]);
      return;
    }

    setIsCheckingUrl(true);
    const problem = await validateImageUrl(url);
    setIsCheckingUrl(false);

    setMessages(problem ? [problem] : []);
    if (!problem) {
      onChange((prev) => [...prev, url]);
      setUrlInput('');
    }
  };

  const allMessages = error ? [...messages, error] : messages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Product Images *</p>
        <span className="text-xs text-neutral-500">
          {images.length} of {MAX_PRODUCT_IMAGES}
        </span>
      </div>

      <div role="tablist" aria-label="Image source" className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={source === tab.id}
            onClick={() => {
              setSource(tab.id);
              setMessages([]);
            }}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold ${
              source === tab.id ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {source === 'gallery' ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            addFiles([...e.dataTransfer.files]);
          }}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-6 text-center border-2 border-dashed rounded-2xl focus-within:outline-2 focus-within:outline-amber-600 ${
            isDragging ? 'border-amber-600 bg-amber-50' : 'border-neutral-300 hover:border-neutral-500 bg-neutral-50'
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="w-5 h-5 text-neutral-600" aria-hidden="true" />
          )}
          <span className="text-xs font-semibold text-neutral-900">
            {isUploading ? 'Preparing images...' : 'Choose images from your device'}
          </span>
          <span className="text-xs text-neutral-500">{IMAGE_FILE_HINT}</span>
          <input
            type="file"
            accept={IMAGE_FILE_ACCEPT}
            multiple
            disabled={isUploading || remainingSlots <= 0}
            aria-label="Choose product images"
            onChange={(e) => {
              addFiles([...(e.target.files ?? [])]);
              e.target.value = '';
            }}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            aria-label="Image URL"
            placeholder="https://example.com/product.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 min-w-0 px-3 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={isCheckingUrl}
            className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 disabled:opacity-60 shrink-0"
          >
            {isCheckingUrl ? 'Checking...' : 'Add'}
          </button>
        </div>
      )}

      {allMessages.length > 0 && (
        <ul role="alert" className="space-y-0.5 text-xs text-rose-700">
          {allMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <li
                key={`${index}-${image.slice(-24)}`}
                className="rounded-xl overflow-hidden border border-neutral-200 bg-white animate-in fade-in"
              >
                <div className="relative aspect-square bg-neutral-100">
                  <img src={image} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-neutral-900 text-white text-[11px] font-bold rounded">
                      Primary
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 divide-x divide-neutral-200 border-t border-neutral-200">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onChange((prev) => [prev[index], ...prev.filter((_, i) => i !== index)])}
                    aria-label={`Make image ${index + 1} the primary image`}
                    title="Make primary"
                    className="flex items-center justify-center py-2 text-neutral-600 hover:text-amber-700 hover:bg-neutral-50 disabled:text-neutral-300"
                  >
                    <Star className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      replaceIndexRef.current = index;
                      replaceInputRef.current?.click();
                    }}
                    aria-label={`Replace image ${index + 1}`}
                    title="Replace"
                    className="flex items-center justify-center py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove image ${index + 1}`}
                    title="Remove"
                    className="flex items-center justify-center py-2 text-neutral-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500">Preview only. Images are saved with the product.</p>
        </>
      )}

      <input
        ref={replaceInputRef}
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleReplaceFile}
        className="hidden"
      />
    </div>
  );
};
