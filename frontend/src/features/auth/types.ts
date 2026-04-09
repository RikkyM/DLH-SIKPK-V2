import type { QueryObserverResult } from "@tanstack/react-query";

export type Role =
  | "superadmin"
  | "admin"
  | "keuangan"
  | "operator"
  | "viewer"
  | string;

export interface User {
  id: number;
  id_department: number | null;
  username: string;
  role: Role;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (cred: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<QueryObserverResult<User | null, Error>>;
}
