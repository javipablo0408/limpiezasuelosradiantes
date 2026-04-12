'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { formatDate, formatEuro, tipoServicioLabel } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Trabajo } from '@/types';

export default function TrabajosPage() {
  const [rows, setRows] = useState<Trabajo[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    supabase.from('trabajos').select('*, inmuebles(*, clientes(*))').order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as Trabajo[]) ?? []));
  }, []);
  const data = useMemo(() => rows.filter((r) => `${r.inmuebles?.clientes?.nombre} ${r.inmuebles?.direccion}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  return <div className="space-y-3">
    <div className="flex gap-2"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente o dirección" /><Button>+ Nuevo trabajo</Button></div>
    <Table columns={['Cliente', 'Dirección', 'Servicio', 'Estado', 'Total', 'Fecha']}>
      {data.map((t) => <tr key={t.id} className="border-b border-[#30363d]">
        <td className="px-3 py-2"><Link href={`/trabajos/${t.id}`}>{t.inmuebles?.clientes?.nombre ?? '-'}</Link></td>
        <td className="px-3 py-2">{t.inmuebles?.direccion ?? '-'}</td>
        <td className="px-3 py-2">{tipoServicioLabel(t.tipo_servicio)}</td>
        <td className="px-3 py-2"><Badge>{t.estado}</Badge></td>
        <td className="px-3 py-2">{formatEuro(t.total ?? 0)}</td>
        <td className="px-3 py-2">{formatDate(t.created_at)}</td>
      </tr>)}
    </Table>
  </div>;
}
