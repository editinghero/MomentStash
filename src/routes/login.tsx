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
