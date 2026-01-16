import { DialogContext, type DialogMode } from "@/context/DialogContext";
import { useCallback, useState, type ReactNode } from "react";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<unknown>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>();

  // // const openDialog = (getData?: unknown) => {
  // //   setData(getData ?? null);
  // //   setIsOpen(true);
  // // };

  const openDialog = useCallback(
    <T,>({ mode, data = null }: { mode: DialogMode; data?: T | null }) => {
      setMode(mode);
      setData(data);
      setIsOpen(true);
    },
    [],
  );

  const closeDialog = () => {
    setData(null);
    setIsOpen(false);
  };

  return (
    <DialogContext.Provider value={{ isOpen, data, mode, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};
