import { useRegisterSW } from "virtual:pwa-register/react";

export function RegisterSW() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  return (
    <>
      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border-2 border-ink bg-paper p-4 shadow-[var(--shadow-lift)]">
          <p className="mb-2 font-body text-sm text-ink">
            New content available, click on reload button to update.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="rounded-full bg-primary px-4 py-1 font-hand text-lg text-paper shadow-[2px_2px_0_var(--color-ink)] transition-all active:translate-y-0.5"
            >
              Reload
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="rounded-full border-2 border-ink px-4 py-1 font-hand text-lg text-ink transition-all hover:bg-accent/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
