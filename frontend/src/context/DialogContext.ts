import { createContext, type ReactNode } from "react";

type DialogContextType = {
  isOpen: boolean;
  content: ReactNode | null;
  openDialog: (content: ReactNode) => void;
  closeDialog: () => void;
};

export const DialogContext = createContext<DialogContextType | null>(null);
