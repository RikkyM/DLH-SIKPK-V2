import AccordionItem from "./AccordionItem";
import { useSidebar } from "@/hooks/useSidebar";
import {
  Banknote,
  CalendarCheck,
  Circle,
  ClipboardList,
  Database,
  Fingerprint,
  LayoutDashboard,
  Users,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-dvh w-full min-w-72 transition-colors lg:relative lg:w-auto lg:max-w-72 lg:min-w-16 lg:bg-transparent ${
        isOpen
          ? "pointer-events-auto bg-black/20"
          : "pointer-events-none bg-transparent lg:pointer-events-auto"
      } `}
      onClick={closeSidebar}
    >
      <div
        className={`group flex h-full max-w-72 flex-col overflow-hidden bg-transparent transition-[cubic-bezier(0.65,0.05,0.36,1)] transition-all duration-300 ${
          isOpen ? "w-72" : "w-0 lg:w-22 lg:hover:w-72"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-scrollbar m-3 h-full overflow-x-hidden overflow-y-auto rounded-xl border border-gray-300 bg-white shadow">
          <header className="grid h-20 w-[calc(288px-27px)] place-items-center">
            <div
              className={`text-center text-xl font-semibold whitespace-nowrap transition-all duration-250 ${
                !isOpen ? "lg:text-transparent" : "delay-200"
              }`}
            >
              DLH SIKPK V2
            </div>
          </header>
          <nav className="no-scrollbar flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-3 text-sm lg:text-base">
            <SidebarItem to="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </SidebarItem>
            <SidebarItem to="/petugas" icon={Users}>
              Petugas
            </SidebarItem>
            <SidebarItem to="/finger" icon={Fingerprint}>
              Finger
            </SidebarItem>
            <SidebarItem to="/kehadiran" icon={CalendarCheck}>
              Kehadiran
            </SidebarItem>
            <SidebarItem to="/rekap-kehadiran" icon={ClipboardList}>
              Rekap Kehadiran
            </SidebarItem>
            <SidebarItem to="/spj-gaji" icon={Banknote}>
              SPJ Hari Upah/Gaji
            </SidebarItem>
            <SidebarItem to="/tambah-update-kehadiran" icon={Banknote}>
              Tambah/Update
            </SidebarItem>
            <AccordionItem
              title="Master Data"
              icon={<Database className="w-6 min-w-6" />}
              routes={[
                "/master-data/kategori-kerja",
                "/master-data/unit-kerja",
                "/master-data/jenis-kendaraan",
                "/master-data/data-kendaraan",
                "/master-data/penugasan",
                "/master-data/pegawai-dlh",
                "/master-data/user-login",
              ]}
            >
              <SidebarItem to="/master-data/kategori-kerja" icon={Circle}>
                Kategori Kerja
              </SidebarItem>
              <SidebarItem to="/master-data/unit-kerja" icon={Circle}>
                Unit Kerja
              </SidebarItem>
              <SidebarItem to="/master-data/jenis-kendaraan" icon={Circle}>
                Jenis Kendaraan
              </SidebarItem>
              <SidebarItem to="/master-data/data-kendaraan" icon={Circle}>
                Data Kendaraan
              </SidebarItem>
              <SidebarItem to="/master-data/penugasan" icon={Circle}>
                Penugasan
              </SidebarItem>
              <SidebarItem to="/master-data/pns-p3k" icon={Circle}>
                PNS / P3K
              </SidebarItem>
              <SidebarItem to="/master-data/petugas-pencairan" icon={Circle}>
                Petugas Pencairan
              </SidebarItem>
              <SidebarItem to="/master-data/user-login" icon={Circle}>
                User Login
              </SidebarItem>
            </AccordionItem>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
