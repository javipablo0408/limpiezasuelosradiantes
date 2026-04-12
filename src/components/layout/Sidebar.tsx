'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ClipboardList, FileText, Home, Settings, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/auth/AdminShell';
import { supabase } from '@/lib/supabase';
import type { RolUsuario } from '@/types';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, group: 'Principal' },
  { href: '/solicitudes', label: 'Presupuestos', icon: ClipboardList, group: 'Gestión', key: 'sol' },
  { href: '/trabajos', label: 'Trabajos', icon: Wrench, group: 'Gestión' },
  { href: '/calendario', label: 'Calendario', icon: Calendar, group: 'Gestión' },
  { href: '/clientes', label: 'Clientes', icon: Users, group: 'Comercial' },
  { href: '/inmuebles', label: 'Inmuebles', icon: Home, group: 'Comercial' },
  { href: '/facturas', label: 'Facturas', icon: FileText, group: 'Comercial' },
  { href: '/informes', label: 'Informes', icon: ClipboardList, group: 'Sistema' },
  { href: '/configuracion', label: 'Configuración', icon: Settings, group: 'Sistema' }
];

export function Sidebar() {
  const pathname = usePathname() ?? '';
  const [nuevas, setNuevas] = useState(0);
  const { role } = useAdminAuth();

  const allowedByRole: Record<RolUsuario, string[]> = {
    admin: items.map((i) => i.href),
    tecnico: ['/calendario']
  };
  const visibleItems = role ? items.filter((item) => allowedByRole[role].includes(item.href)) : [];

  useEffect(() => {
    supabase.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estado', 'nueva')
      .then(({ count }) => setNuevas(count ?? 0));
  }, []);

  return (
    <aside className="h-screen w-[220px] shrink-0 border-r border-[#30363d] bg-[#161b22] p-3 text-[#e6edf3]">
      <div className="mb-5 rounded-md bg-[#21262d] p-3 text-sm font-semibold">Panel TSV</div>
      {['Principal', 'Gestión', 'Comercial', 'Sistema'].map((group) => (
        <div key={group} className="mb-4">
          <div className="mb-1 px-2 text-xs uppercase tracking-wide text-[#8b949e]">{group}</div>
          {visibleItems.filter((i) => i.group === group).map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center justify-between rounded-md border px-2 py-2 text-sm ${
                  active
                    ? 'border-teal-400/60 bg-teal-500/20 text-teal-200'
                    : 'border-transparent hover:border-[#30363d] hover:bg-[#21262d]'
                }`}
              >
                <span className="flex items-center gap-2"><Icon size={15} />{item.label}</span>
                {item.key === 'sol' && nuevas > 0 ? (
                  <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs text-black">{nuevas}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
