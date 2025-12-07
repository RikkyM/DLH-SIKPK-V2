import { useAuth } from "@/features/auth";
import { Navigate, Outlet } from "react-router-dom";

type RoleBasedRouteProps = {
  allowedRoles: string[];
};

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  const hasPermission = user && allowedRoles.includes(user.role);

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
