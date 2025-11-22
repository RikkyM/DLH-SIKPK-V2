import { NavLink } from "react-router-dom";
import AccordionItem from "./AccordionItem";
import { useSidebar } from "@/hooks/useSidebar";
import { Circle, Database, LayoutDashboard, Users } from "lucide-react";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

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
        className={`group h-full max-w-72 overflow-hidden bg-[#FAFAFA] transition-[cubic-bezier(0.65,0.05,0.36,1)] transition-all duration-300 ${
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
        <nav className="space-y-3 p-3 text-sm lg:text-base">
          <NavLink
            to="/dashboard"
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-[#171717] text-white shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <LayoutDashboard className="w-6 min-w-6" />
            <span
              className={`transition-opacity duration-250 ${
                isOpen
                  ? "delay-200 lg:opacity-100"
                  : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
              }`}
            >
              Dashboard
            </span>
          </NavLink>
          <NavLink
            to="/pegawai"
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-[#171717] text-white shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <Users className="w-6 min-w-6" />
            <span
              className={`transition-opacity duration-250 ${
                isOpen
                  ? "delay-200 lg:opacity-100"
                  : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
              }`}
            >
              Pegawai
            </span>
          </NavLink>
          <NavLink
            to="/kehadiran"
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-[#171717] text-white shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <Circle className="w-6 min-w-6" />
            <span
              className={`transition-opacity duration-250 ${
                isOpen
                  ? "delay-200 lg:opacity-100"
                  : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
              }`}
            >
              Kehadiran
            </span>
          </NavLink>
          <NavLink
            to="/rekap-kehadiran"
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-[#171717] text-white shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <Circle className="w-6 min-w-6" />
            <span
              className={`transition-opacity duration-250 ${
                isOpen
                  ? "delay-200 lg:opacity-100"
                  : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
              }`}
            >
              Rekap Kehadiran
            </span>
          </NavLink>
          <NavLink
            to="/spj-gaji"
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                isActive
                  ? "bg-[#171717] text-white shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <Circle className="w-6 min-w-6" />
            <span
              className={`transition-opacity duration-250 ${
                isOpen
                  ? "delay-200 lg:opacity-100"
                  : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
              }`}
            >
              SPJ Hari Upah/Gaji
            </span>
          </NavLink>
          <AccordionItem
            title="Master Data"
            icon={<Database className="w-6 min-w-6" />}
            routes={["/shift-kerja"]}
          >
            <NavLink
              to="/shift-kerja"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                Shift Kerja
              </span>
            </NavLink>
            <NavLink
              to="/department"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                Department
              </span>
            </NavLink>
            <NavLink
              to="/jenis-kendaraan"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                Jenis Kendaraan
              </span>
            </NavLink>
            <NavLink
              to="/data-kendaraan"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                Data Kendaraan
              </span>
            </NavLink>
            <NavLink
              to="/jabatan"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                Jabatan
              </span>
            </NavLink>
            <NavLink
              to="/user-login"
              onClick={handleNavClick}
              className={({ isActive }) =>
                [
                  "block flex items-center gap-2 rounded p-2 whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-[#171717] text-white shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              <Circle className="w-6 min-w-6" />
              <span
                className={`transition-opacity duration-250 ${
                  isOpen
                    ? "delay-200 lg:opacity-100"
                    : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
                }`}
              >
                User Login
              </span>
            </NavLink>
          </AccordionItem>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
