import AccordionItem from "./AccordionItem";
import { useSidebar } from "@/hooks/useSidebar";
import {
  Banknote,
  CalendarCheck,
  Circle,
  ClipboardList,
  Database,
  LayoutDashboard,
  Users,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <aside
      className={`fixed top-0 left-0 z-10 h-dvh w-full min-w-72 border-r border-gray-300 shadow transition-colors lg:relative lg:w-auto lg:max-w-72 lg:min-w-16 lg:bg-transparent ${
        isOpen
          ? "pointer-events-auto bg-black/20"
          : "pointer-events-none bg-transparent lg:pointer-events-auto"
      } `}
      onClick={closeSidebar}
    >
      <div
        className={`group flex h-full max-w-72 flex-col overflow-hidden bg-[#FAFAFA] transition-[cubic-bezier(0.65,0.05,0.36,1)] transition-all duration-300 ${
          isOpen ? "w-72" : "w-0 lg:w-16 lg:hover:w-72"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="min-w-72 p-3">
          <div
            className={`text-center text-xl font-semibold whitespace-nowrap transition-all duration-500 ${
              !isOpen ? "lg:text-transparent" : ""
            }`}
          >
            DLH SIKPK V2
          </div>
        </header>
        <nav className="space-y-2 overflow-x-hidden overflow-y-auto p-3 text-sm lg:text-base no-scrollbar">
          <SidebarItem to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </SidebarItem>
          <SidebarItem to="/pegawai" icon={Users}>
            Pegawai
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
          <AccordionItem
            title="Master Data"
            icon={<Database className="w-6 min-w-6" />}
            routes={["/jenis-kendaraan"]}
          >
            <SidebarItem to="/shift-kerja" icon={Circle}>
              Shift Kerja
            </SidebarItem>
            <SidebarItem to="/department" icon={Circle}>
              Department
            </SidebarItem>
            <SidebarItem to="/jenis-kendaraan" icon={Circle}>
              Jenis Kendaraan
            </SidebarItem>
            <SidebarItem to="/data-kendaraan" icon={Circle}>
              Data Kendaraan
            </SidebarItem>
            <SidebarItem to="/jabatan" icon={Circle}>
              Jabatan
            </SidebarItem>
            <SidebarItem to="/korlap" icon={Circle}>
              Korlap
            </SidebarItem>
            <SidebarItem to="/user-login" icon={Circle}>
              User Login
            </SidebarItem>
          </AccordionItem>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
