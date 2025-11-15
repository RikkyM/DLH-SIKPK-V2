import { Route, Routes } from "react-router-dom";
import Login from "../../features/auth/pages/Login";
import { PublicRoute } from "./guards/PublicRoute";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import DashboardPages from "@/features/dashboard/pages/Index";
import PegawaiPages from "@/features/pegawai/pages/Index";
// import Dashboard from "../../pages/dashboard/Dashboard";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPages />} />
        <Route path="/pegawai" element={<PegawaiPages />} />
      </Route>
    </Routes>
  );
};
