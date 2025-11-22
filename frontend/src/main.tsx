import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./app/routes/AppRoutes";
import AppProvider from "./app/providers/AppProvider";
import { SidebarProvider } from "./providers/SidebarProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <SidebarProvider>
        <AppRoutes />
      </SidebarProvider>
    </AppProvider>
  </StrictMode>
);
