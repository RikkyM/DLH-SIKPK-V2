import { createContext } from "react";

export type DialogMode = "add" | "edit" | "detail" | "delete" | undefined;

type DialogContextType = {
  isOpen: boolean;
  data: unknown;
  mode: DialogMode;
  openDialog: <T>(params: {mode: DialogMode, data?: T}) => void;
  closeDialog: () => void;
};

export const DialogContext = createContext<DialogContextType | null>(null);
