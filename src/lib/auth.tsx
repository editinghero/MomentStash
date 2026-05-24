import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type MomentStashUser = {
  id: string;
  name: string;
  email: string;
  avatarDataUrl?: string;
  gdriveLinked?: boolean;
};

type AuthCtx = {
  user: MomentStashUser | null;
  ready: boolean;
  login: () => void;
  signup: () => void;
  updateProfile: (profile: { name: string; avatarDataUrl?: string }) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MomentStashUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => console.error("Auth fetch error:", err))
      .finally(() => setReady(true));
  }, []);

  const login = () => {
    window.location.href = "/api/auth/google";
  };

  const signup = () => {
    window.location.href = "/api/auth/google";
  };

  const updateProfile: AuthCtx["updateProfile"] = (profile) => {
    if (!user) return;
    setUser({
      ...user,
      name: profile.name.trim() || user.name,
      avatarDataUrl: profile.avatarDataUrl,
    });
    // In a full app, we would POST to /api/auth/profile
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const deleteAccount = async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider
      value={{
        user,
        ready,
        login,
        signup,
        updateProfile,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
