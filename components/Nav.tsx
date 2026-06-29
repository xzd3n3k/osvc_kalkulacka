import Link from 'next/link';

export function Nav() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-0">
        {/* Brand */}
        <Link
          href="/"
          className="mr-4 flex items-baseline gap-2 py-4 text-[var(--color-text)] no-underline"
        >
          <span className="text-base font-semibold tracking-tight">OSVČ kalkulačka</span>
          <span className="rounded bg-[var(--color-accent-subtle)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            BETA
          </span>
        </Link>

        {/* Nav links */}
        <Link
          href="/"
          className="relative py-4 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Kalkulačka
        </Link>
        <Link
          href="/legislativa"
          className="ml-2 py-4 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Legislativa
        </Link>
      </nav>
    </header>
  );
}
