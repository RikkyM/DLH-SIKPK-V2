import { PAGE_TITLE } from "@/constants/pageTitles";
import { useAuth } from "@/features/auth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSidebar } from "@/hooks/useSidebar";
import { Menu, RefreshCcw } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const { handleLogout, loading } = useLogout();
  const { pathname } = useLocation();
  const { toggleSidebar } = useSidebar();

  const pageTitle = PAGE_TITLE[pathname] ?? pathname.replace("/", "");

  return (
    <div className="top-0 left-0 flex h-20 w-full items-center justify-between gap-2 bg-[#FA6443] px-5 text-white">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer outline-none"
          onClick={toggleSidebar}
        >
          <Menu className="max-w-5" />
        </button>
        <h2 className="font-semibold capitalize lg:text-xl">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-2">
        <p className="capitalize">{user?.username.toLowerCase()}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="m-2 cursor-pointer rounded bg-red-500 px-3 py-1.5 text-white shadow min-w-[8ch]"
        >
          {loading ? (
            <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
