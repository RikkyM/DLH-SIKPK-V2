import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import MainLayout from "@/layouts/MainLayout";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
