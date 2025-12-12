import type { Role } from "@/features/auth";
import { http } from "@/services/api/http";
import type { Department } from "@/types/department.types";
import type { Pagination } from "@/types/pagination.types";
import { useCallback, useEffect, useState } from "react";

type UserType = {
  id: number;
  username: string;
  role: Role;
  department: Department;
};

type UserState = {
  data: Pagination<UserType> | null;
  loading: boolean;
  error: string | null;
};

export const useUser = (perPage = 50, page = 1, search = "") => {
  const [state, setState] = useState<UserState>({
    data: null,
    loading: false,
    error: null,
  });

  const getUser = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
    }));
    try {
      const res = await http.get("/api/v1/data-user", {
        params: {
          page,
          per_page: perPage,
          search,
        },
      });
      setState((prev) => ({
        ...prev,
        data: res.data,
        loading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal mendapatkan data user.",
      }));
    }
  }, [page, perPage, search]);

  useEffect(() => {
    void getUser();
  }, [getUser]);

  return {
    datas: state.data,
    loading: state.loading,
    error: state.error,
  };
};
