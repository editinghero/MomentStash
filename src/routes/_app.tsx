import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-transparent">
        <p className="font-hand text-2xl text-ink-soft">unfolding…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-0 md:pt-16">
      <Outlet />
      <AppNav />
      <Toaster />
    </div>
  );
}
