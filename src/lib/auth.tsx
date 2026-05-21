import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type MomentStashUser = { name: string; email: string };

type AuthCtx = {
  user: MomentStashUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_USER = "momentstash_user";
const STORAGE_USERS = "momentstash_users"; // { [email]: { name, password } }

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MomentStashUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = (u: MomentStashUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_USER);
  };

  const readUsers = (): Record<string, { name: string; password: string }> => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USERS) || "{}");
    } catch {
      return {};
    }
  };

  const login: AuthCtx["login"] = async (email, password) => {
    const users = readUsers();
    const rec = users[email.toLowerCase()];
    if (!rec || rec.password !== password) {
      throw new Error("Invalid email or password.");
    }
    persist({ name: rec.name, email: email.toLowerCase() });
  };

  const signup: AuthCtx["signup"] = async (name, email, password) => {
    const users = readUsers();
    const key = email.toLowerCase();
    if (users[key]) throw new Error("An account with that email already exists.");
    users[key] = { name, password };
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    persist({ name, email: key });
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, ready, login, signup, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
