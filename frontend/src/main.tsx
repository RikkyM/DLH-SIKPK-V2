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
      <SidebarProvider>
        <DialogProvider>
          <AppRoutes />
        </DialogProvider>
      </SidebarProvider>
    </AppProvider>
  </StrictMode>,
);
