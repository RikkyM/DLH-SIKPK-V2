import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      console.error("Logout failed.");
    }
  };

  return {
    handleLogout,
  };
};
