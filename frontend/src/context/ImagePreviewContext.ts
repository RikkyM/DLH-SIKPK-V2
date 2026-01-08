import { createContext } from "react";

type ImagePreviewContextType = {
  openPreview: (src: string) => void;
};

export const ImagePreviewContext = createContext<ImagePreviewContextType | null>(null);