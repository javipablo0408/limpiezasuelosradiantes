import type { Metadata } from 'next';
import { DM_Mono, DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { AdminShell } from '@/components/auth/AdminShell';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'limpiezasuelosradiantes.com',
    template: '%s | limpiezasuelosradiantes.com'
  },
  description: 'Limpieza profesional de suelo radiante y panel de gestión TSV Servicios.'
};

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-display' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <AdminShell>{children}</AdminShell>
        <Toast />
      </body>
    </html>
  );
}
