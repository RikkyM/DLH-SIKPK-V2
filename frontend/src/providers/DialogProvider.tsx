import { DialogContext } from "@/context/DialogContext";
import { useState, type ReactNode } from "react";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const openDialog = (node: ReactNode) => {
    setContent(node);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setContent(null);
  };

  return (
    <DialogContext.Provider
      value={{ isOpen, content, openDialog, closeDialog }}
    >
      {children}
    </DialogContext.Provider>
  );
};
