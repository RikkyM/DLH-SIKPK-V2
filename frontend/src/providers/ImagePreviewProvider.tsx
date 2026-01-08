import { ImagePreviewContext } from "@/context/ImagePreviewContext";
import { X } from "lucide-react";
import {  useState, type ReactNode } from "react";

export const ImagePreviewProvider = ({ children }: { children: ReactNode }) => {
  const [image, setImage] = useState<string | null>(null);

  const openPreview = (src: string) => setImage(src);
  const closePreview = () => setImage(null);

  return (
    <ImagePreviewContext.Provider value={{ openPreview }}>
      {children}

      {image && (
        <div
          className="fixed inset-0 z-99 flex items-center justify-center bg-black/80"
          onClick={closePreview}
        >
          <img
            src={image}
            className="max-h-[90vh] max-w-[90vw] rounded shadow-xl"
            onClick={(e) => e.stopPropagation()}
            alt="Preview"
          />

          <button
            className="absolute top-4 right-4 text-white"
            onClick={closePreview}
          >
            <X size={28} />
          </button>
        </div>
      )}
    </ImagePreviewContext.Provider>
  );
};