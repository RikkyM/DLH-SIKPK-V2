import { DialogContext } from "@/context/DialogContext";
import { useContext } from "react";

export const useDialog = <T>() => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  return {
    isOpen: ctx.isOpen,
    data: ctx.data as T | null,
    openDialog: (data?: T) =>  ctx.openDialog(data),
    closeDialog: ctx.closeDialog
  };
};
