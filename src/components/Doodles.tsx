export function StarDoodle({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L13.6 9.4 L20 11 L13.6 12.6 L12 19 L10.4 12.6 L4 11 L10.4 9.4 Z" fill={color} fillOpacity="0.25" />
    </svg>
  );
}

export function HeartDoodle({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

export function SparkleDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
    </svg>
  );
}

export function ArrowSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 25 C 20 5, 40 35, 60 18 S 85 8, 95 20" />
      <path d="M88 14 L95 20 L88 26" />
    </svg>
  );
}

export function UnderlineSquiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 10" className={className} preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 6 C 20 2, 40 9, 60 5 S 100 2, 118 6" />
    </svg>
  );
}
