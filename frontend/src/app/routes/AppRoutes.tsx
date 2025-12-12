import { Route, Routes } from "react-router-dom";
import Login from "@/features/auth/pages/Login";
import { PublicRoute } from "@/app/routes/guards/PublicRoute";
import { ProtectedRoute } from "@/app/routes/guards/ProtectedRoute";
import DashboardPages from "@/features/dashboard/pages/Index";
import PegawaiPages from "@/features/pegawai/pages/Index";
import UpahPages from "@/features/gaji/pages/Index";
import JenisKendaraanPages from "@/features/jenisKendaraan/pages/Index";
import RekapKehadiranPages from "@/features/kehadiran/pages/RekapKehadiran";
import KehadiranPages from "@/features/kehadiran/pages/Index";
import { IndexRedirect } from "./guards/IndexRoute";
import ShiftKerjaPages from "@/features/shiftKerja/pages/Index";
import JabatanPages from "@/features/jabatan/pages/Index";
import DepartmentPages from "@/features/department/pages/Index";
import DataKendaraanPages from "@/features/dataKendaraan/pages/Index";
import FingerPages from "@/features/finger/pages/Index";
import RekapTanggalHadirPages from "@/features/rekapKehadiran/pages/Index";
import PnsPages from "@/features/pns/pages/Index";
import { RoleBasedRoute } from "./guards/RoleBasedRoute";
import UserLoginPages from "@/features/userLogin/pages/Index";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPages />} />
        <Route
          element={
            <RoleBasedRoute
              allowedRoles={["superadmin", "admin", "operator"]}
            />
          }
        >
          <Route path="/petugas" element={<PegawaiPages />} />
          <Route path="/log-kehadiran" element={<FingerPages />} />
          <Route path="/kehadiran-harian" element={<KehadiranPages />} />
          <Route
            path="/kehadiran-per-tanggal"
            element={<RekapKehadiranPages />}
          />
          <Route
            path="/rekap-tanggal-hadir"
            element={<RekapTanggalHadirPages />}
          />
        </Route>
        <Route
          element={<RoleBasedRoute allowedRoles={["superadmin", "keuangan"]} />}
        >
          <Route path="/spj-gaji" element={<UpahPages />} />
        </Route>

        <Route path="/master-data">
          <Route path="kategori-kerja" element={<ShiftKerjaPages />} />
          <Route path="unit-kerja" element={<DepartmentPages />} />
          <Route path="jenis-kendaraan" element={<JenisKendaraanPages />} />
          <Route path="data-kendaraan" element={<DataKendaraanPages />} />
          <Route path="penugasan" element={<JabatanPages />} />
          <Route path="pns-p3k" element={<PnsPages />} />
          <Route path="user-login" element={<UserLoginPages />} />
        </Route>
      </Route>

      {/* <Route path="*" element={<IndexRedirect />} /> */}
    </Routes>
  );
};
