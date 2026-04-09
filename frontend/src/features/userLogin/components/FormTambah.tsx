import { useAuth, type Role } from "@/features/auth";
import { useDepartment } from "@/hooks/useDepartment";
import { useDialog } from "@/hooks/useDialog";
import { useFormErrors } from "@/hooks/useFormErrors";
import { http } from "@/services/api/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { RefreshCcw } from "lucide-react";
import React, { useState } from "react";

type UserLoginForm = {
  id_department: number | null;
  username: string;
  role: Role;
  password?: string;
  password_confirmation?: string;
};

const FormTambah = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { mode, isOpen, closeDialog } = useDialog();
  const { departments } = useDepartment();

  const { getError, clearError, setValidationErrors, resetErrors } =
    useFormErrors();

  const [formData, setFormData] = useState<UserLoginForm>({
    id_department: null,
    username: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

  const { mutateAsync, isPending } = useMutation<
    unknown,
    unknown,
    UserLoginForm
  >({
    mutationFn: async (payload) => {
      const res = await http.post<UserLoginForm>("/api/v1/data-user", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-user"] });

      setFormData({
        id_department: null,
        username: "",
        password: "",
        password_confirmation: "",
        role: "",
      });

      closeDialog();
      resetErrors();
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
          setValidationErrors(err.response.data.errors);
        }
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      ...(name === "id_department"
        ? { [name]: value ? Number(value) : null }
        : { [name]: value }),
    }));

    clearError(name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    resetErrors();

    await mutateAsync(formData);
  };

  if (mode !== "add") return null;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      className={`max-h-[600px] w-full max-w-xl space-y-3 overflow-y-auto rounded-sm bg-white shadow transition-all duration-300 ${
        isOpen ? "scale-100" : "scale-95"
      }`}
    >
      <h2 className="sticky top-0 bg-white p-3 font-semibold lg:text-lg">
        Edit User Login
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid w-full gap-1.5 space-y-2 px-3 pb-3 md:gap-2"
      >
        <div className="space-y-1 text-sm">
          <label htmlFor="username" className="block font-medium">
            Username
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            type="text"
            id="username"
            name="username"
            placeholder="Masukkan Username..."
            value={formData?.username ?? ""}
            onChange={handleChange}
          />
          {getError("username") && (
            <p className="text-xs text-red-500">{getError("username")}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="id_department" className="block font-medium">
            Unit Kerja
          </label>
          <select
            name="id_department"
            id="id_department"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={formData?.id_department ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Unit Kerja
            </option>
            <option value="">-</option>
            {departments?.map((department, index) => (
              <option
                key={department.DeptID ?? index}
                value={department.DeptID}
                className="text-xs font-medium"
              >
                {department?.DeptName}
              </option>
            ))}
          </select>
          {getError("id_department") && (
            <p className="text-xs text-red-500">{getError("id_department")}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="role" className="block font-medium">
            Role
          </label>
          <select
            name="role"
            id="role"
            className="w-full cursor-pointer appearance-none rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            value={formData?.role ?? ""}
            onChange={handleChange}
          >
            <option value="" disabled hidden>
              Pilih Role User
            </option>
            {!!user && user.role === "superadmin" && (
              <option value="superadmin">Superadmin</option>
            )}
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="keuangan">Keuangan</option>
            <option value="viewer">Viewer</option>
          </select>
          {getError("role") && (
            <p className="text-xs text-red-500">{getError("role")}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            type="password"
            id="password"
            name="password"
            placeholder="Masukkan Password..."
            value={formData?.password ?? ""}
            onChange={handleChange}
          />
          {getError("password") && (
            <p className="text-xs text-red-500">{getError("password")}</p>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <label htmlFor="password_confirmation" className="block font-medium">
            Password
          </label>
          <input
            className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 disabled:cursor-not-allowed disabled:border-none disabled:bg-transparent"
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            placeholder="Masukkan Konfirmasi Password..."
            value={formData?.password_confirmation ?? ""}
            onChange={handleChange}
          />
          {getError("password_confirmation") && (
            <p className="text-xs text-red-500">
              {getError("password_confirmation")}
            </p>
          )}
        </div>
        <div className="flex w-full place-content-end gap-2">
          <button
            type="button"
            onClick={() => {
              closeDialog();
              resetErrors();
            }}
            className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-red-600"
          >
            Batal
          </button>
          <button className="w-[10ch] cursor-pointer rounded bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-green-600">
            {isPending ? (
              <RefreshCcw className="mx-auto max-h-5 max-w-4 animate-spin" />
            ) : (
              "Simpan"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormTambah;
