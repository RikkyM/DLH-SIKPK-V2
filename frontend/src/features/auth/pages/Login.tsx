import AuthLayout from "@/layouts/AuthLayout";
import logo from "@/assets/img/dlh-logo.webp";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import LoginForm from "./components/LoginForm";
import { useEffect } from "react";

const Login = () => {
  const loginForm = useLoginForm();

  useEffect(() => {
    document.title = "Login";
  }, []);

  return (
    <AuthLayout>
      <div className="z-10 mx-auto max-w-md space-y-3 rounded-md border border-gray-300 bg-white/50 p-5 shadow backdrop-blur-md">
        <img src={logo} alt="logo" className="mx-auto max-w-36" />
        <h2 className="text-center text-sm font-semibold">
          <span className="inline-block">
            Sistem Informasi Kehadiran Pegawai Kebersihan Versi 2
          </span>
          <span className="inline-block"> (SIKPK V2)</span>
        </h2>

        <LoginForm {...loginForm} />

        <hr className="mt-5" />
        <div className="text-center text-xs text-gray-500">
          © 2025 SIKPK DLH Kota Palembang
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
