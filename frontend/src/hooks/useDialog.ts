import { DialogContext } from "@/context/DialogContext";
import { useContext } from "react";

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  return ctx;
};
