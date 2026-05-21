import { createFileRoute, Link } from "@tanstack/react-router";
import { Polaroid } from "@/components/Polaroid";
import { StickerButton } from "@/components/StickerButton";
import { WashiTape } from "@/components/WashiTape";
import { StarDoodle, HeartDoodle, ArrowSquiggle, UnderlineSquiggle, SparkleDoodle } from "@/components/Doodles";
import { Calendar, MapPin, Camera } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

import coffee from "@/assets/photo-coffee.jpg";
import sunset from "@/assets/photo-sunset.jpg";
import flowers from "@/assets/photo-flowers.jpg";
import clothes from "@/assets/photo-clothes.jpg";
import sky from "@/assets/photo-sky.jpg";
import croissant from "@/assets/photo-croissant.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MomentStash — Your life, handcrafted." },
      {
        name: "description",
        content:
          "MomentStash is a digital scrapbook for your tiny daily magic — cafes, sunsets, and quiet moments, gathered into a handmade memory vault.",
      },
      { property: "og:title", content: "MomentStash — Your life, handcrafted." },
      {
        property: "og:description",
        content: "A digital diary for your cafes, sunsets, and quiet moments.",
      },
    ],
  }),
  component: LandingPage,
});

function Nav() {
  const links = [
    { label: "Home", to: "/" as const },
    { label: "Sign in", to: "/login" as const },
  ];
  return (
    <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
      <Link to="/" className="font-display text-3xl font-bold text-ink">
        Moment<span className="font-hand text-primary text-4xl">Stash</span>
      </Link>
      <ul className="hidden md:flex items-center gap-8">
        {links.map((l, i) => (
          <li key={l.label} className="relative">
            <Link to={l.to} className="font-accent text-sm font-semibold text-ink hover:text-primary transition-colors">
              {l.label}
            </Link>
            {i === 0 && (
              <UnderlineSquiggle className="absolute -bottom-2 left-0 h-2 w-full text-primary" />
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link to="/login" className="hidden sm:block">
          <StickerButton variant="cream">Sign in</StickerButton>
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-6 pb-24 md:px-10 md:pt-10">
      {/* Floating decorations */}
      <StarDoodle className="absolute top-10 left-1/2 h-8 w-8 text-accent animate-float" color="oklch(0.85 0.13 90)" />
      <SparkleDoodle className="absolute top-32 right-1/4 h-6 w-6 text-secondary opacity-60" />
      <HeartDoodle className="absolute bottom-32 left-[20%] h-6 w-6 text-primary opacity-70" color="oklch(0.7 0.15 12)" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
        {/* Left polaroid cluster */}
        <div className="relative hidden lg:block lg:col-span-3 h-[420px]">
          <div className="absolute top-0 left-4 animate-float" style={{ ["--r" as string]: "-6deg" }}>
            <Polaroid src={coffee} alt="Cafe latte" caption="cozy mornings" rotate={-6} tape="yellow" className="w-52" />
          </div>
          <div className="absolute top-40 left-32 animate-float" style={{ ["--r" as string]: "8deg", animationDelay: "1.2s" }}>
            <Polaroid src={sunset} alt="Sunset" caption="07.10.23" rotate={8} tape="pink" className="w-44" />
          </div>
          <div className="absolute top-56 left-0 animate-float" style={{ ["--r" as string]: "-3deg", animationDelay: "2.4s" }}>
            <Polaroid src={flowers} alt="Flowers" caption="from a friend" rotate={-3} tape="lavender" className="w-44" />
          </div>
          <HeartDoodle className="absolute top-24 -left-2 h-7 w-7 text-primary" color="oklch(0.7 0.15 12)" />
        </div>

        {/* Center copy */}
        <div className="lg:col-span-6 text-center relative">
          <p className="font-hand text-2xl text-secondary mb-4">— a tiny love letter to your days —</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink leading-[1.05]">
            Save the <span className="inline-block wobble-tilt text-primary">Tiny Magic</span>
            <br />
            of Every Day
          </h1>
          <p className="mt-6 font-body text-lg md:text-xl text-ink-soft max-w-xl mx-auto">
            A digital diary for your cafés, sunsets, and quiet moments — folded into a handmade scrapbook only you keep.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link to="/login"><StickerButton>Start Your Journey</StickerButton></Link>
            <a href="#features" className="font-accent text-sm font-semibold text-ink-soft underline underline-offset-4 decoration-wavy decoration-primary">
              See how it folds →
            </a>
          </div>
          <ArrowSquiggle className="mx-auto mt-8 h-10 w-32 text-ink-soft opacity-50 hidden md:block" />
        </div>

        {/* Right polaroid cluster */}
        <div className="relative hidden lg:block lg:col-span-3 h-[420px]">
          <div className="absolute top-4 right-0 animate-float" style={{ ["--r" as string]: "6deg" }}>
            <Polaroid src={clothes} alt="Outfit" caption="thrift haul" rotate={6} tape="mint" className="w-52" />
          </div>
          <div className="absolute top-44 right-28 animate-float" style={{ ["--r" as string]: "-8deg", animationDelay: "1s" }}>
            <Polaroid src={sky} alt="Sky" caption="3pm clouds" rotate={-8} tape="yellow" className="w-44" />
          </div>
          <div className="absolute top-60 right-4 animate-float" style={{ ["--r" as string]: "4deg", animationDelay: "2s" }}>
            <Polaroid src={croissant} alt="Croissant" caption="bakery run" rotate={4} tape="pink" className="w-44" />
          </div>
          <StarDoodle className="absolute top-2 -right-2 h-7 w-7 text-secondary" color="oklch(0.7 0.13 295)" />
        </div>

        {/* Mobile polaroid strip */}
        <div className="lg:hidden flex justify-center gap-4 -mt-6">
          <Polaroid src={coffee} alt="Coffee" caption="hi mornings" rotate={-6} tape="yellow" className="w-32" />
          <Polaroid src={sunset} alt="Sunset" caption="07.10" rotate={4} tape="pink" className="w-32" />
          <Polaroid src={flowers} alt="Flowers" caption="bloom" rotate={-2} tape="lavender" className="w-32" />
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Calendar,
      title: "Visual Timeline",
      desc: "A scrapbook feed where every day is a layered, hand-pinned page.",
      color: "primary",
    },
    {
      icon: MapPin,
      title: "Memory Map",
      desc: "Drop sticker-pins on a watercolor map and revisit the places that mattered.",
      color: "tertiary",
    },
    {
      icon: Camera,
      title: "Quick Save",
      desc: "Snap a photo, scribble a note, pick a mood. Done in under a minute.",
      color: "secondary",
    },
  ] as const;

  return (
    <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="text-center mb-16">
        <p className="font-accent text-xs font-bold tracking-[0.3em] text-primary uppercase">What's inside the fold</p>
        <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-ink">
          Three little ways to keep the day
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-10 md:gap-6">
        {items.map((it, i) => {
          const Icon = it.icon;
          const rot = [-2, 1.5, -1][i];
          const tapeColors = ["pink", "mint", "lavender"] as const;
          return (
            <div key={it.title} className="relative" style={{ transform: `rotate(${rot}deg)` }}>
              <WashiTape color={tapeColors[i]} rotate={-6 + i * 4} className="absolute -top-3 left-8 z-10" width="6rem" />
              <div className="paper-card relative torn-bottom px-7 pt-10 pb-14 min-h-[300px]">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-paper-deep mb-5 sticker-shadow">
                  <Icon className="h-6 w-6 text-ink" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink">{it.title}</h3>
                <p className="mt-3 font-body text-base text-ink-soft leading-relaxed">{it.desc}</p>
                <p className="absolute bottom-6 right-6 font-hand text-lg text-primary">no. 0{i + 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TimelinePreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-10">
      <div className="text-center mb-14">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-ink">A peek at your timeline</h2>
        <p className="mt-3 font-hand text-2xl text-secondary">— scroll, smile, remember —</p>
      </div>

      {/* Hand-drawn axis */}
      <div className="relative">
        <svg className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px text-ink-soft hidden md:block" viewBox="0 0 2 800" preserveAspectRatio="none">
          <path d="M1 0 V800" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
        </svg>

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 relative">
          <TimelineCard
            date="OCT 25, 2024"
            title="A Rainy Tuesday"
            note="Hid in the corner of a tiny café and watched the windows fog. Coffee was perfect."
            img={coffee}
            caption="cozy rainy day!"
            tilt={-2}
            tape="pink"
          />
          <div className="md:mt-32">
            <TimelineCard
              date="OCT 26, 2024"
              title="Golden Hour Stroll"
              note="The whole sky turned the color of peach jam. Walked home the long way on purpose."
              img={sunset}
              caption="sunset at the bridge"
              tilt={2}
              tape="yellow"
            />
          </div>
          <TimelineCard
            date="OCT 28, 2024"
            title="Bloom Day"
            note="Bought myself flowers for no reason. Highly recommend."
            img={flowers}
            caption="for me, from me"
            tilt={1.5}
            tape="lavender"
          />
          <div className="md:mt-32">
            <TimelineCard
              date="OCT 30, 2024"
              title="Bakery Run"
              note="Croissant the size of my face. Worth the wait in the rain."
              img={croissant}
              caption="flaky perfection"
              tilt={-1.5}
              tape="mint"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineCard({
  date, title, note, img, caption, tilt, tape,
}: {
  date: string; title: string; note: string; img: string; caption: string; tilt: number;
  tape: "pink" | "mint" | "lavender" | "yellow";
}) {
  return (
    <div className="relative" style={{ transform: `rotate(${tilt}deg)` }}>
      <WashiTape color={tape} rotate={-8} className="absolute -top-3 left-10 z-10" width="7rem" />
      <WashiTape color="yellow" rotate={12} className="absolute -top-2 right-10 z-10" width="5rem" />
      <div className="paper-card relative torn-bottom p-6 md:p-8">
        <div className="flex items-start gap-5">
          <Polaroid src={img} alt={title} caption={caption} rotate={-3} tape={tape} className="w-40 shrink-0" />
          <div className="pt-2 flex-1">
            <span className="inline-block border border-ink-soft px-2 py-0.5 font-accent text-[10px] tracking-widest text-ink-soft">
              {date}
            </span>
            <h3 className="mt-3 font-display text-2xl font-bold text-ink">{title}</h3>
            <p className="mt-2 font-hand text-xl text-ink-soft leading-snug">{note}</p>
          </div>
        </div>
        <HeartDoodle className="absolute -bottom-3 right-8 h-6 w-6 text-primary" color="oklch(0.7 0.15 12)" />
      </div>
    </div>
  );
}

function CTA() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
      <div className="relative inline-block">
        <StarDoodle className="absolute -top-6 -left-8 h-10 w-10 text-accent" color="oklch(0.8 0.13 90)" />
        <StarDoodle className="absolute -top-2 -right-10 h-8 w-8 text-secondary" color="oklch(0.7 0.13 295)" />
        <h2 className="font-hand text-5xl md:text-6xl text-ink leading-tight">
          Your Life, Handcrafted.
        </h2>
      </div>
      <p className="mt-6 font-body text-lg text-ink-soft max-w-xl mx-auto">
        Start with a single moment today. The vault remembers the rest.
      </p>
      <div className="mt-10">
        <Link to="/login"><StickerButton>Get Started — it's free</StickerButton></Link>
      </div>
      <HeartDoodle className="mx-auto mt-8 h-6 w-6 text-primary" color="oklch(0.7 0.15 12)" />
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-dashed border-ink-soft/30 mt-12">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-xl text-ink">
          Moment<span className="font-hand text-primary text-2xl">Stash</span>
        </p>
        <p className="font-accent text-xs tracking-widest text-ink-soft uppercase">
          made with paper, tape & care · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <Features />
      <TimelinePreview />
      <CTA />
      <Footer />
    </main>
  );
}
