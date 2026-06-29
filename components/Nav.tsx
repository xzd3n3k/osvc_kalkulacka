import Link from 'next/link';

export function Nav() {
  return (
    <nav className="mb-8 flex items-center gap-6 border-b border-slate-200 pb-4">
      <Link href="/" className="font-semibold">OSVČ kalkulačka</Link>
      <Link href="/legislativa" className="text-sm text-slate-600 hover:text-slate-900">Legislativa</Link>
    </nav>
  );
}
