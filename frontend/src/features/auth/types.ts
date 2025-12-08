export type Role =
  | "superadmin"
  | "admin"
  | "operator"
  | "viewer"
  | string;

export interface User {
  id: number;
  name: string;
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
  login: (cred: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}