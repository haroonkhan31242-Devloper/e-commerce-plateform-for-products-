import React, { useState } from 'react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import {
  IMAGE_FILE_ACCEPT,
  uploadProductImage,
  validateImageFile,
} from '../../services/imageStorage.ts';

type ImageSource = 'gallery' | 'url';

const SOURCE_TABS: { id: ImageSource; label: string; icon: React.ReactNode }[] = [
  { id: 'gallery', label: 'Upload from Gallery', icon: <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" /> },
  { id: 'url', label: 'Image URL', icon: <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> },
];

interface CategoryImagePickerProps {
  image: string;
  onChange: (image: string) => void;
  label?: string;
  showPreview?: boolean;
}

export const CategoryImagePicker: React.FC<CategoryImagePickerProps> = ({
  image,
  onChange,
  label = 'Category Banner / Card Image',
  showPreview = true,
}) => {
  const [source, setSource] = useState<ImageSource>('gallery');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const addFile = async (file?: File) => {
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      setMessage(problem);
      return;
    }

    setIsUploading(true);
    try {
      onChange(await uploadProductImage(file));
      setMessage('');
    } catch (error) {
      console.error('Category image upload failed', error);
      setMessage(`${file.name} could not be read. It may be damaged.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-bold text-neutral-700 uppercase tracking-wider">{label}</p>

      <div role="tablist" aria-label="Image source" className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={source === tab.id}
            onClick={() => {
              setSource(tab.id);
              setMessage('');
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
            addFile(e.dataTransfer.files[0]);
          }}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-5 text-center border-2 border-dashed rounded-2xl cursor-pointer focus-within:outline-2 focus-within:outline-amber-600 ${
            isDragging ? 'border-amber-600 bg-amber-50' : 'border-neutral-300 hover:border-neutral-500 bg-neutral-50'
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-neutral-600 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="w-5 h-5 text-neutral-600" aria-hidden="true" />
          )}
          <span className="text-xs font-semibold text-neutral-900">
            {isUploading ? 'Preparing image...' : 'Choose an image from your device'}
          </span>
          <span className="text-xs text-neutral-500">JPG, PNG, or WebP, up to 5 MB.</span>
          <input
            type="file"
            accept={IMAGE_FILE_ACCEPT}
            disabled={isUploading}
            aria-label="Choose category image"
            onChange={(e) => {
              addFile(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="sr-only"
          />
        </label>
      ) : (
        <input
          type="url"
          aria-label="Image URL"
          placeholder="https://example.com/category.jpg"
          // An uploaded image is stored as a long data string, which is meaningless in this box
          value={image.startsWith('data:') ? '' : image}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-xl"
        />
      )}

      {message && (
        <p role="alert" className="text-xs text-rose-700">
          {message}
        </p>
      )}

      {showPreview && image && (
        <img loading="lazy" decoding="async" src={image} alt="" className="w-full h-24 object-cover rounded-xl bg-neutral-100" />
      )}
    </div>
  );
};
