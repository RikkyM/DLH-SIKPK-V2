import { createContext } from "react";

type DialogContextType = {
  isOpen: boolean;
  data: unknown;
  openDialog: (data?: unknown) => void;
  closeDialog: () => void;
};

export const DialogContext = createContext<DialogContextType | null>(null);
