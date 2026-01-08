import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./app/routes/AppRoutes";
import AppProvider from "./app/providers/AppProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { DialogProvider } from "./providers/DialogProvider";
import { ImagePreviewProvider } from "./providers/ImagePreviewProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <ImagePreviewProvider>
        <SidebarProvider>
          <DialogProvider>
            <AppRoutes />
          </DialogProvider>
        </SidebarProvider>
      </ImagePreviewProvider>
    </AppProvider>
  </StrictMode>,
);
