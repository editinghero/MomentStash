import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate({ to: "/home" });
  }, [ready, user, navigate]);

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

        <div className="relative w-full paper-card rounded-[28px] border-2 border-ink/80 p-8 wobble-tilt text-center">
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

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-ink">
              Welcome to the stash
            </h1>
            <div className="relative inline-block mt-1">
              <p className="font-hand text-2xl text-primary">
                let's keep folding
              </p>
              <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
            </div>
          </div>

          <p className="font-hand text-xl text-ink-soft mb-8">
            Sign in to start backing up your memories securely.
          </p>

           <button
             type="button"
             onClick={() => (window.location.href = "/api/auth/google")}
             className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-4 py-3 font-hand text-xl text-ink hover:bg-gray-50 transition shadow-[3px_4px_0_var(--color-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_3px_0_var(--color-ink)] cursor-pointer dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:shadow-[3px_4px_0_#3f3f46] dark:hover:bg-zinc-800"
           >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs font-accent text-ink-soft/70">
          We use Google Drive to securely back up your photos.
        </p>
      </div>
    </main>
  );
}
