import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { StickerButton } from "@/components/StickerButton";
import {
  StarDoodle,
  HeartDoodle,
  SparkleDoodle,
  UnderlineSquiggle,
} from "@/components/Doodles";
import { WashiTape } from "@/components/WashiTape";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MomentStash" },
      {
        name: "description",
        content: "Sign in to your MomentStash scrapbook.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, ready, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/home" });
  }, [ready, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name || "Friend", email, password);
      navigate({ to: "/home" });
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent">
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle />
      </div>
      <StarDoodle
        className="absolute top-12 left-10 h-10 w-10 text-accent animate-float"
        color="oklch(0.85 0.13 90)"
      />
      <SparkleDoodle className="absolute top-24 right-16 h-7 w-7 text-secondary opacity-70" />
      <HeartDoodle
        className="absolute bottom-20 left-1/4 h-7 w-7 text-primary opacity-70"
        color="oklch(0.7 0.15 12)"
      />
      <SparkleDoodle className="absolute bottom-32 right-20 h-6 w-6 text-tertiary opacity-60" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
        <Link to="/" className="font-display text-3xl font-bold text-ink mb-8">
          Moment<span className="font-hand text-primary text-4xl">Stash</span>
        </Link>

        <div className="relative w-full paper-card rounded-[28px] border-2 border-ink/80 p-8 wobble-tilt">
          <WashiTape
            color="pink"
            rotate={-6}
            width="6rem"
            className="absolute -top-3 left-8"
          />
          <WashiTape
            color="mint"
            rotate={8}
            width="5rem"
            className="absolute -top-3 right-8"
          />

          <div className="text-center mb-6">
            <h1 className="font-display text-3xl text-ink">
              {mode === "login" ? "Welcome back" : "Start your scrapbook"}
            </h1>
            <div className="relative inline-block mt-1">
              <p className="font-hand text-2xl text-primary">
                {mode === "login" ? "let's keep folding" : "every day, a page"}
              </p>
              <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field
                label="Your name"
                value={name}
                onChange={setName}
                placeholder="Amelia"
                type="text"
              />
            )}
            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@momentstash.me"
              type="email"
              required
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
              required
            />

            {err && (
              <div className="rounded-md border-2 border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive font-accent">
                {err}
              </div>
            )}

            <StickerButton type="submit" disabled={busy} className="w-full">
              {busy
                ? "..."
                : mode === "login"
                  ? "Open my scrapbook →"
                  : "Create my scrapbook →"}
            </StickerButton>

            <div className="relative my-4 flex items-center py-2">
              <div className="grow border-t-2 border-ink/10"></div>
              <span className="shrink-0 px-3 font-accent text-xs uppercase text-ink-soft">Or</span>
              <div className="grow border-t-2 border-ink/10"></div>
            </div>

            <a href="/api/auth/google" className="block w-full">
              <button type="button" className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-3 font-hand text-xl text-ink hover:bg-gray-50 transition shadow-[3px_4px_0_var(--color-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_3px_0_var(--color-ink)]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </a>
          </form>

          <p className="mt-6 text-center text-sm font-accent text-ink-soft">
            {mode === "login" ? "New here?" : "Already have one?"}{" "}
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMode(mode === "login" ? "signup" : "login");
              }}
              className="font-hand text-xl text-primary underline decoration-wavy underline-offset-4 hover:text-primary/80"
            >
              {mode === "login" ? "make a scrapbook" : "sign in"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-accent text-ink-soft/70">
          Saved locally on this device — no account needed elsewhere.
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-hand text-lg text-ink">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-2 border-ink/70 bg-paper px-4 py-3 font-body text-ink placeholder:text-ink-soft/50 outline-none focus:border-primary focus:shadow-[3px_4px_0_var(--color-ink)] transition"
      />
    </label>
  );
}
