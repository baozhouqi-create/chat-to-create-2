
import React, { useState } from 'react';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onGenerate: (prompt: string, base64Image?: string, mimeType?: string) => void;
  isGenerating: boolean;
}

const RemixModal: React.FC<RemixModalProps> = ({ isOpen, onClose, prompt, onGenerate, isGenerating }) => {
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedImageBase64(base64);
        setUploadedImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUploadedImageBase64(null);
    setUploadedImageMimeType(null);
    // Reset file input value as well
    const fileInput = document.getElementById('remix-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleGenerateClick = () => {
    onGenerate(prompt, uploadedImageBase64 || undefined, uploadedImageMimeType || undefined);
    // Modal will close automatically via App.tsx state change after generation starts
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Remix Your Idea ✨
        </h2>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white/70">Selected Prompt:</label>
          <p className="text-xs text-white/50 bg-white/5 p-3 rounded-xl max-h-20 overflow-y-auto hide-scrollbar">
            {prompt}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="remix-image-upload" className="text-sm font-semibold text-white/70 flex items-center gap-2">
            Upload Image (Optional)
            <span className="text-[10px] text-white/30">(for character reference)</span>
          </label>
          <input
            id="remix-image-upload"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label 
            htmlFor="remix-image-upload" 
            className="w-full flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 cursor-pointer hover:border-purple-500/50 transition-colors"
          >
            <i className="fa-solid fa-cloud-arrow-up mr-2"></i>
            {uploadedImageBase64 ? 'Change Image' : 'Click to Upload'}
          </label>

          {uploadedImageBase64 && (
            <div className="relative mt-2">
              <img src={`data:${uploadedImageMimeType};base64,${uploadedImageBase64}`} alt="Uploaded remix" className="w-full h-32 object-cover rounded-xl border border-white/10" />
              <button 
                onClick={clearImage} 
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                aria-label="Clear uploaded image"
              >
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white/70 bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-palette"></i>
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemixModal;
