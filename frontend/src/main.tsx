import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-icon";
import { AppRoutes } from "./app/routes/AppRoutes";
import AppProvider from "./app/providers/AppProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import { DialogProvider } from "./providers/DialogProvider";
import { ImagePreviewProvider } from "./providers/ImagePreviewProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ImagePreviewProvider>
          <SidebarProvider>
            <DialogProvider>
              <AppRoutes />
            </DialogProvider>
          </SidebarProvider>
        </ImagePreviewProvider>
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
