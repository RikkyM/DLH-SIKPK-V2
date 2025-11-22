import { NavLink } from "react-router-dom";
import AccordionItem from "./AccordionItem";
import { useSidebar } from "@/hooks/useSidebar";
import { Database, LayoutDashboard } from "lucide-react";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <aside
      className={`h-dvh w-full min-w-72 lg:w-auto lg:min-w-16 lg:max-w-72 lg:bg-transparent shadow border-r border-gray-300 fixed top-0 left-0 lg:relative z-10
          ${
            isOpen
              ? "bg-black/20 pointer-events-auto"
              : "bg-transparent pointer-events-none lg:pointer-events-auto"
          }
        `}
      onClick={closeSidebar}
    >
      {/* <aside className="flex-1 h-dvh w-full max-w-72 bg-red-500"> */}
      <div
        className={`max-w-72 transition-all duration-300  transition-[cubic-bezier(0.65,0.05,0.36,1)] overflow-hidden h-full bg-[#FAFAFA] ${
          isOpen ? "w-72 " : "w-0 lg:w-16"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-3 min-w-72">
          <div
            className={`text-center text-xl font-semibold whitespace-nowrap transition-all duration-500 ${
              !isOpen ? "lg:text-transparent" : ""
            }`}
          >
            DLH SIKPK V2
          </div>
        </header>
        <nav className="p-3 space-y-3 ">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                "block p-2 transition-colors duration-500 whitespace-nowrap flex items-center gap-2",
                isActive
                  ? "text-white bg-[#171717] rounded shadow"
                  : "text-black hover:bg-gray-500/20",
              ].join(" ")
            }
          >
            <LayoutDashboard className="min-w-6 w-6" />
            <span className={`transition-all duration-250 ${isOpen ? "lg:opacity-100 delay-200" : "lg:opacity-0"}`}>
              Dashboard
            </span>
          </NavLink>
          <AccordionItem
            title="Master Data"
            Icon={<Database className="min-w-6 w-6" />}
            routes={["/pegawai", "/kehadiran", "/spj-gaji"]}
          >
            <NavLink
              to="/pegawai"
              className={({ isActive }) =>
                [
                  "block p-2 transition-colors duration-500",
                  isActive
                    ? "text-white bg-[#171717] rounded shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              Pegawai
            </NavLink>
            <NavLink
              to="/kehadiran"
              className={({ isActive }) =>
                [
                  "block p-2 transition-colors duration-500",
                  isActive
                    ? "text-white bg-[#171717] rounded shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              Kehadiran
            </NavLink>
            <NavLink
              to="/spj-gaji"
              className={({ isActive }) =>
                [
                  "block p-2 transition-colors duration-500",
                  isActive
                    ? "text-white bg-[#171717] rounded shadow"
                    : "text-black hover:bg-gray-500/20",
                ].join(" ")
              }
            >
              SPJ Hari Upah/Gaji
            </NavLink>
          </AccordionItem>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
