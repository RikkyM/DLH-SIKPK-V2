import { useAuth } from "@/features/auth";
import { Navigate, Outlet } from "react-router-dom";

type RoleBasedRouteProps = {
  allowedRoles: string[];
};

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  //   const hasPermission = user && allowedRoles.includes(user.role);

  //   if (!hasPermission) {
  //     return <Navigate to="/dashboard" replace />;
  //   }

  const normalizedRole = user?.role?.toLowerCase?.() ?? "";
  const hasPermission = allowedRoles.includes(normalizedRole);

  // Sudah login tapi role tidak cocok → redirect ke dashboard atau 403
  if (!hasPermission) {
    // Bisa juga render halaman 403 Forbidden di sini
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
