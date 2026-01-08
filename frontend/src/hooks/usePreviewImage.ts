import { ImagePreviewContext } from "@/context/ImagePreviewContext";
import { useContext } from "react";

export const useImagePreview = () => {
  const ctx = useContext(ImagePreviewContext);
  if (!ctx) {
    throw new Error("useImagePreview must be used inside ImagePreviewProvider");
  }
  return ctx;
};
