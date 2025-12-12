import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useState } from "react";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate("/login", { replace: true });
      setLoading(false);
    } catch {
      console.error("Logout failed.");
      setLoading(false);
    }
  };

  return {
    handleLogout,
    loading
  };
};
