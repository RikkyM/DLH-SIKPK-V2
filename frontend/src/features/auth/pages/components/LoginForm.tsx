import type React from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import type { LoginCredentials } from "@/features/auth/types";
import { FormField } from "./FormField";

type LoginFormProps = {
  formData: LoginCredentials;
  loading: boolean;
  error: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
};

const LoginForm = ({
  formData,
  loading,
  error,
  handleChange,
  handleSubmit,
}: LoginFormProps) => {
  return (
    <>
      {error && (
        <p className="w-full text-center text-xs text-red-500">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField
          label="Username"
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Username"
          required
        />
        <FormField
          label="Password"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Password"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 w-full rounded py-2 text-sm font-medium text-white cursor-pointer"
        >
          {loading ? (
            <LoaderCircle className="animate-spin mx-auto max-w-5" />
          ) : (
            <div className="flex items-center gap-2 mx-auto w-max">
              <LogIn className="max-w-5" />
              <span>Masuk</span>
            </div>
          )}
        </button>
      </form>
    </>
  );
};

export default LoginForm;
