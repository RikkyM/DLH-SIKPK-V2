import { AuthProvider } from "@/features/auth";
import { type PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

const AppProvider = ({ children }: PropsWithChildren) => {
  return (
    <BrowserRouter basename="/absen">
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

export default AppProvider;
