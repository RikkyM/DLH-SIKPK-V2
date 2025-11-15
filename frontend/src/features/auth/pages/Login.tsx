import AuthLayout from "@/layouts/AuthLayout";
import logo from "@/assets/img/dlh-logo.webp";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import LoginForm from "./components/LoginForm";

const Login = () => {
  const loginForm = useLoginForm();

  return (
    <AuthLayout>
      <div className="mx-auto space-y-3 p-5 z-10 bg-white/50 backdrop-blur-md max-w-md rounded-md shadow border border-gray-300">
        <img src={logo} alt="logo" className="max-w-36 mx-auto" />
        <h2 className="text-sm text-center font-semibold">
          <span className="inline-block">
            Sistem Informasi Kehadiran Pegawai Kebersihan Versi 2
          </span>
          <span className="inline-block"> (SIKPK V2)</span>
        </h2>

        <LoginForm {...loginForm} />

        <hr className="mt-5" />
        <div className="text-xs text-center text-gray-500">
          © 2025 SIKPK DLH Kota Palembang
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
