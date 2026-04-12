'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { formatDate, formatEuro } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Factura } from '@/types';

export default function FacturasPage() {
  const [rows, setRows] = useState<Factura[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    supabase.from('facturas').select('*, trabajos(*, inmuebles(*, clientes(*)))').order('created_at', { ascending: false }).then(({ data }) => setRows((data as Factura[]) ?? []));
  }, []);
  const data = useMemo(() => rows.filter((r) => `${r.numero} ${r.trabajos?.inmuebles?.clientes?.nombre ?? ''}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  return <div className="space-y-3">
    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar factura" />
    <Table columns={['Número', 'Cliente', 'Fecha', 'Total', 'Estado']}>
      {data.map((f) => <tr key={f.id} className="border-b border-[#30363d]">
        <td className="px-3 py-2"><Link href={`/facturas/${f.id}`}>{f.numero}</Link></td><td className="px-3 py-2">{f.trabajos?.inmuebles?.clientes?.nombre ?? '-'}</td>
        <td className="px-3 py-2">{formatDate(f.fecha)}</td><td className="px-3 py-2">{formatEuro(f.total)}</td><td className="px-3 py-2"><Badge>{f.estado}</Badge></td>
      </tr>)}
    </Table>
  </div>;
}
