'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/components/auth/AdminShell';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { RolUsuario } from '@/types';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/solicitudes': 'Presupuestos',
  '/trabajos': 'Trabajos',
  '/calendario': 'Calendario',
  '/clientes': 'Clientes',
  '/inmuebles': 'Inmuebles',
  '/presupuestos': 'Presupuestos',
  '/facturas': 'Facturas',
  '/informes': 'Informes',
  '/configuracion': 'Configuración'
};

export function Topbar() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { role } = useAdminAuth();
  const root = `/${pathname.split('/')[1]}`;
  const title = titles[root] ?? 'Panel';
  const ctaByRoute: Record<string, { label: string; href: string } | null> = {
    '/dashboard': null,
    '/solicitudes': null,
    '/trabajos': { label: 'Nuevo trabajo', href: '/trabajos' },
    '/calendario': { label: 'Nueva visita', href: '/calendario' },
    '/clientes': { label: 'Nuevo cliente', href: '/clientes?nuevo=1' },
    '/inmuebles': { label: 'Nuevo inmueble', href: '/inmuebles?nuevo=1' },
    '/presupuestos': null,
    '/facturas': null,
    '/informes': { label: 'Subir informe', href: '/informes' },
    '/configuracion': null
  };
  const allowedCtaByRole: Record<RolUsuario, string[]> = {
    admin: ['/trabajos', '/calendario', '/clientes', '/inmuebles', '/informes'],
    tecnico: []
  };
  const cta = role && allowedCtaByRole[role].includes(root) ? ctaByRoute[root] ?? null : null;
  return (
    <header className="flex h-[52px] items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4">
      <h1 className="text-sm font-semibold text-[#e6edf3]">{title}</h1>
      <div className="flex items-center gap-2">
        {cta ? (
          <Link href={cta.href}>
            <Button size="sm">{cta.label}</Button>
          </Link>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }}
        >
          Salir
        </Button>
      </div>
    </header>
  );
}
