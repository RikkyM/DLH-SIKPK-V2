import { SidebarContext } from "@/context/SidebarContext";
import { useContext } from "react";

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return ctx;
};
