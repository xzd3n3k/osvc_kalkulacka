import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OSVČ kalkulačka odvodů',
  description: 'Srovnání daní a odvodů OSVČ napříč daňovými režimy. Zadej obrat a uvidíš, který režim se ti vyplatí nejvíce.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="flex min-h-dvh flex-col">
          {children}
          <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] py-6 text-center text-xs text-[var(--color-text-subtle)]">
            Kalkulačka slouží jako orientační pomůcka. Ověřte si výsledky s daňovým poradcem.
            &nbsp;·&nbsp; Zdroje legislativy odkazují na officiální weby správce daně.
          </footer>
        </div>
      </body>
    </html>
  );
}
