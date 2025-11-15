import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import MainLayout from "@/layouts/MainLayout";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;

  return user ? (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ) : (
    <Navigate to="/login" replace state={{ from: loc }} />
  );
};
