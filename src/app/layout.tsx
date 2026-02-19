import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cinzel, Crimson_Pro } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const cinzel = Cinzel({ variable: '--font-cinzel', subsets: ['latin'], weight: ['400', '700', '900'] });
const crimsonPro = Crimson_Pro({ variable: '--font-crimson', subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Tactical Viewer – Warhammer 40,000',
  description: 'BattleScribe / NewRecruit JSON to datacard converter. Stats & rules from Wahapedia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${crimsonPro.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
