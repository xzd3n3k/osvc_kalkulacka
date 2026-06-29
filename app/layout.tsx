import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OSVČ kalkulačka',
  description: 'Srovnání odvodů OSVČ napříč daňovými režimy podle aktuální legislativy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
