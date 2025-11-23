import { createContext } from "react";

type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  notMobile: () => void;
};

export const SidebarContext = createContext<SidebarContextType | null>(null);
