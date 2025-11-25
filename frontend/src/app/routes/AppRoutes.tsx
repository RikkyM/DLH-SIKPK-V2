import { Route, Routes } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import { PublicRoute } from "@/app/routes/guards/PublicRoute";
import { ProtectedRoute } from "@/app/routes/guards/ProtectedRoute";
import DashboardPages from "@/features/dashboard/pages/Index";
import PegawaiPages from "@/features/pegawai/pages/Index";
import UpahPages from "@/features/gaji/pages/Index";
import JenisKendaraanPages from "@/features/jenisKendaraan/pages/Index";
import RekapKehadiranPages from "@/features/rekapKehadiran/pages/Index";
import KehadiranPages from "@/features/kehadiran/pages/Index";
import { IndexRedirect } from "./guards/IndexRoute";
import ShiftKerjaPages from "@/features/shiftKerja/pages/Index";
import JabatanPages from "@/features/jabatan/pages/Index";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPages />} />
        <Route path="/pegawai" element={<PegawaiPages />} />
        <Route path="/kehadiran" element={<KehadiranPages />} />
        <Route path="/rekap-kehadiran" element={<RekapKehadiranPages />} />
        <Route path="/spj-gaji" element={<UpahPages />} />

        <Route path="/master-data">
          <Route path="shift-kerja" element={<ShiftKerjaPages />} />
          <Route path="jenis-kendaraan" element={<JenisKendaraanPages />} />
          <Route path="jabatan" element={<JabatanPages />} />
        </Route>
      </Route>

      {/* <Route path="*" element={<IndexRedirect />} /> */}
    </Routes>
  );
};
