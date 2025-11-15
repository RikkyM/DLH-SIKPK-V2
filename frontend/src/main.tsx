import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRoutes } from "./app/routes/AppRoutes";
import AppProvider from "./app/providers/AppProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </StrictMode>
);
