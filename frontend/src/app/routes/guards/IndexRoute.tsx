import { useAuth } from "@/features/auth";
import { Navigate } from "react-router-dom";

export const IndexRedirect = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};
