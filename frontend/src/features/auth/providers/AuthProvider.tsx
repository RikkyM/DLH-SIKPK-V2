import { useCallback, useMemo, type ReactNode } from "react";
import { type LoginCredentials, type User } from "../types";
import { http } from "@/services/api/http";
import { AuthContext } from "../context/AuthContext";
import { login as loginApi, logout as logoutApi } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const {
    data: user,
    isLoading: loading,
    error,
    refetch: refresh,
  } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await http.get("/api/v1/user");
      return res.data;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (cred: LoginCredentials) => loginApi(cred),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  const login = useCallback(
    async (cred: LoginCredentials) => {
      await loginMutation.mutateAsync(cred);
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo(
    () => ({
      user: user ?? null,
      loading,
      error: error ? "Terjadi kesalahan pada server. Silakan coba lagi" : null,
      login,
      logout,
      refresh,
    }),
    [user, loading, login, error, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
