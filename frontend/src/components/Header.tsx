import { useAuth } from "@/features/auth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { pathname } = useLocation();

  return (
    <div className="flex gap-2 items-center left-0 top-0 w-full justify-between px-5 h-20">
      <h2 className="text-xl font-semibold capitalize">{pathname.replace("/", "")}</h2>
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
