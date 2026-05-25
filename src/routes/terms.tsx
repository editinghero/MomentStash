import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WashiTape } from "@/components/WashiTape";
import { UnderlineSquiggle, SparkleDoodle } from "@/components/Doodles";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — MomentStash" },
      {
        name: "description",
        content: "Our acceptable use policy and terms of care.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
            Terms of Service
          </h1>
          <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
        </div>

        <div className="paper-card p-6 md:p-10 rounded-[32px] border-2 border-ink space-y-8 relative shadow-[var(--shadow-paper)]">
          <WashiTape
            color="pink"
            rotate={2}
            width="6rem"
            className="absolute -top-3 left-10 pointer-events-none"
          />

          <div className="space-y-4">
            <p className="font-body text-base text-ink-soft leading-relaxed">
              Welcome to MomentStash. By logging in, creating scrapbooks, or
              accessing our services, you agree to these Terms of Service.
              Please read them with care.
            </p>
            <p className="font-accent text-[10px] uppercase tracking-wider text-ink-soft">
              Last Updated: May 25, 2026
            </p>
          </div>

          <hr className="border-dashed border-ink/20" />

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              1. Acceptance of Terms
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              MomentStash is provided as a personal, digital diary scrapbook. By
              creating an account, you represent that you are at least 13 years
              of age and fully capable of entering into these terms.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              2. User Accounts & Security
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              We leverage Google OAuth to authenticate your account securely.
              You are responsible for maintaining the privacy and security of
              your Google credentials. MomentStash will never request your
              Google passwords.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              3. Content Ownership & License
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              All text, formatting, mood stickers, tags, and photos you add to
              MomentStash remain **exclusively yours**. We claim zero
              intellectual property or distribution rights over your memories.
              You represent that you own or have the necessary rights to all
              photos and content you upload.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              4. Acceptable Conduct
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              You agree to use MomentStash solely for lawful, personal purposes.
              You must not upload malicious payload scripts, attempt to execute
              reverse-engineering, bypass database authorization rules, or
              compromise server security.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              5. Disclaimer of Warranties
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              MomentStash is provided "as is" and "as available," without
              warranties of any kind, either express or implied, including but
              not limited to warranties of merchantability, fitness for a
              particular purpose, or non-infringement. We make every effort to
              preserve your diary entries, but suggest using the download backup
              function regularly to prevent data loss.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-ink">
              6. Modifications to Service & Terms
            </h3>
            <p className="font-body text-base text-ink-soft leading-relaxed">
              We reserve the right to modify or discontinue parts of the
              application or update these terms over time. Continued use of
              MomentStash following updates represents acceptance of the revised
              terms.
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
