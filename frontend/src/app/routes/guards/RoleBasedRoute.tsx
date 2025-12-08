import { useAuth } from "@/features/auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type RoleBasedRouteProps = {
  allowedRoles: string[];
};

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const hasPermission = user && allowedRoles.includes(user.role);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
