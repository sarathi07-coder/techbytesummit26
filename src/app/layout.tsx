import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ReagentWatch AI — Peri-Urban Chemical Hazard Governance',
  description: 'Autonomous laboratory chemical degradation monitoring, offline-first voice reporting, and cluster disposal governance for peri-urban secondary schools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

