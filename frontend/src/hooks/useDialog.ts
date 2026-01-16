import { DialogContext, type DialogMode } from "@/context/DialogContext";
import { useContext } from "react";

export const useDialog = <T>() => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  return {
    isOpen: ctx.isOpen,
    data: ctx.data as T | null,
    mode: ctx.mode,
    openDialog: (params: { mode: DialogMode; data?: T | null }) =>
      ctx.openDialog(params),
    closeDialog: ctx.closeDialog,
  };
};
