import { DialogContext } from "@/context/DialogContext";
import { useState, type ReactNode } from "react";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<unknown>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = (getData?: unknown) => {
    setData(getData ?? null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setData(null);
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider value={{ isOpen, data, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};
