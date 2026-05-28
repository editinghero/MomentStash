import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WashiTape } from "@/components/WashiTape";
import { UnderlineSquiggle, SparkleDoodle } from "@/components/Doodles";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MomentStash" },
      {
        name: "description",
        content: "How we collect, use, and protect your handcrafted memories.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper/95 text-ink flex flex-col justify-between overflow-x-hidden">
      {/* Navigation */}
      <nav className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="font-display text-3xl font-bold text-ink">
          Moment<span className="font-hand text-primary text-4xl">Stash</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/"
            className="font-accent text-sm font-semibold text-ink-soft hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-3xl w-full px-6 py-12 md:py-20 flex-1 relative">
        <SparkleDoodle className="absolute top-10 right-4 h-8 w-8 text-accent animate-float pointer-events-none" />

        <p className="font-accent text-xs uppercase tracking-[0.2em] text-ink-soft">
          legal & care
        </p>
        <div className="relative inline-block mb-10">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink mt-1">
            Privacy Policy
          </h1>
          <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
        </div>

        <div className="paper-card p-6 md:p-10 rounded-[32px] border-2 border-ink space-y-8 relative shadow-[var(--shadow-paper)]">
          <WashiTape
            color="lavender"
            rotate={-3}
            width="6rem"
            className="absolute -top-3 left-10 pointer-events-none"
          />

          <div className="space-y-4">
            <p className="font-body text-base text-ink-soft leading-relaxed">
              At MomentStash, we value the trust you place in us to safeguard
              your quiet wonders and daily magic. We believe in absolute data
              ownership and complete privacy. This document details how your
              information is handled.
            </p>
            <p className="font-accent text-[10px] uppercase tracking-wider text-ink-soft">
              Last Updated: May 25, 2026
            </p>
          </div>

          <hr className="border-dashed border-ink/20" />

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              1. Information We Collect
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              When you authenticate using your Google Account, we receive
              profile information including your:
            </p>
            <ul className="list-disc pl-5 font-body text-base text-ink-soft space-y-1">
              <li>Google Account ID (used to uniquely authenticate you)</li>
              <li>Email address (for communication and identification)</li>
              <li>Profile name (to personalize your handbook interface)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              2. Google Drive Permissions
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              MomentStash requests permission to access your **Google Drive
              Application Data Folder**
              (`https://www.googleapis.com/auth/drive.appdata`).
            </p>
            <ul className="list-disc pl-5 font-body text-base text-ink-soft space-y-2">
              <li>
                This folder is a private, isolated storage environment dedicated
                solely to MomentStash.
              </li>
              <li>
                We use this permission to upload and retrieve photos you attach
                to your daily scrapbook entries.
              </li>
              <li>
                We cannot view, access, or modify any other files in your
                general Google Drive.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              3. How Your Data is Stored
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              Your scrapbook text, tags, shelves, and metadata are securely
              stored in our **Cloudflare D1 SQL database**. If Google Drive is
              not linked, photos are stored locally in the D1 database as base64
              data URLs. All files are shielded behind cryptographically secure
              authentication boundaries.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              4. No Sharing or Monetization
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              We never sell, distribute, share, or monetize your memories or
              personal data with any third-party advertisers, data brokers, or
              services. Your memories belong to you, and you alone.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              5. Account Deletion & Right to Erase
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              You maintain complete control. You can delete your account
              permanently at any time directly through the app interface.
              Deletion immediately and irrevocably deletes all of your database
              entries, configurations, and unlinks your Google Account
              parameters.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              6. Contact Care
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              If you have any questions or feedback about this Privacy Policy,
              please contact us at{" "}
              <span className="font-bold underline">
                astralquarks.entrust317@passfwd.com
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-ink-soft/30 py-6 text-center">
        <p className="font-accent text-[10px] tracking-widest text-ink-soft uppercase">
          MomentStash © {new Date().getFullYear()} · Handcrafted Memories
        </p>
      </footer>
    </main>
  );
}
