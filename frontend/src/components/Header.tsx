import { useAuth } from "@/features/auth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSidebar } from "@/hooks/useSidebar";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { pathname } = useLocation();
  const { toggleSidebar } = useSidebar();

  const PAGE_TITLE: Record<string, string> = {
    '/dashboard': "Dashboard",
    '/pegawai':   "Data Pegawai",
    '/kehadiran': "Data Kehadiran",
    "/spj-gaji": "SPJ Hari Upah/Gaji"
  }

  const pageTitle = PAGE_TITLE[pathname] ?? pathname.replace("/", '');

  return (
    <div className="flex gap-2 items-center left-0 top-0 w-full justify-between px-5 h-20">
      <div className="flex items-center gap-2">
        <button type="button" className="cursor-pointer" onClick={toggleSidebar}>
          <Menu className="max-w-5"/>
        </button>
        <h2 className="text-xl font-semibold capitalize">{pageTitle}</h2>
      </div>
      <div className="flex gap-2 items-center">
        <p className="capitalize">{user?.username.toLowerCase()}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer text-white px-3 py-1.5 bg-red-500 m-2 rounded shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
