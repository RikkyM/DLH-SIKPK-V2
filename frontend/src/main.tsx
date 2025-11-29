import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./app/routes/AppRoutes";
import AppProvider from "./app/providers/AppProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { DialogProvider } from "./providers/DialogProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <DialogProvider>
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </DialogProvider>
    </AppProvider>
  </StrictMode>,
);
