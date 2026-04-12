'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { formatDateTime, formatEuro } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Solicitud, Visita } from '@/types';

type Metricas = { clientes: number; trabajos: number; presupuestos: number; facturas: number };
type SumRow = { total: number | null };

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<Metricas>({ clientes: 0, trabajos: 0, presupuestos: 0, facturas: 0 });
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);

  useEffect(() => {
    (async () => {
      const [c, t, p, f, s, v] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('trabajos').select('id', { count: 'exact', head: true }).not('estado', 'in', '(completado,cancelado)'),
        supabase.from('presupuestos').select('total,estado').in('estado', ['enviado', 'aceptado']),
        supabase.from('facturas').select('total,estado').in('estado', ['emitida', 'enviada']),
        supabase.from('solicitudes').select('*').eq('estado', 'nueva').order('created_at', { ascending: false }).limit(8),
        supabase.from('visitas').select('*, usuarios(*), trabajos(*, inmuebles(*, clientes(*)))')
          .in('estado', ['pendiente', 'confirmada'])
          .gt('fecha_inicio', new Date().toISOString())
          .order('fecha_inicio', { ascending: true })
          .limit(8)
      ]);
      setMetricas({
        clientes: c.count ?? 0,
        trabajos: t.count ?? 0,
        presupuestos: ((p.data as SumRow[] | null) ?? []).reduce((a, x) => a + (x.total ?? 0), 0),
        facturas: ((f.data as SumRow[] | null) ?? []).reduce((a, x) => a + (x.total ?? 0), 0)
      });
      setSolicitudes((s.data as Solicitud[]) ?? []);
      setVisitas((v.data as Visita[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>Clientes activos<br /><strong>{metricas.clientes}</strong></Card>
        <Card>Trabajos en curso<br /><strong>{metricas.trabajos}</strong></Card>
        <Card>Presupuestos<br /><strong>{formatEuro(metricas.presupuestos)}</strong></Card>
        <Card>Facturas<br /><strong>{formatEuro(metricas.facturas)}</strong></Card>
      </div>
      <Table columns={['Nombre', 'Teléfono', 'm²', 'Precio', 'Urgente', 'Fecha', '']}>
        {solicitudes.map((s) => (
          <tr key={s.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">{s.nombre}</td><td className="px-3 py-2">{s.telefono}</td><td className="px-3 py-2">{s.m2}</td>
            <td className="px-3 py-2">{formatEuro(s.precio_estimado ?? 0)}</td><td className="px-3 py-2">{s.es_urgente ? 'Sí' : 'No'}</td>
            <td className="px-3 py-2">{formatDateTime(s.created_at)}</td><td className="px-3 py-2"><Link href={`/solicitudes/${s.id}`}>Ver</Link></td>
          </tr>
        ))}
      </Table>
      <Card>
        <h3 className="mb-2 font-semibold">Próximas visitas</h3>
        {visitas.length === 0 ? <EmptyState title="No hay visitas próximas" /> : (
          <div className="space-y-2 text-sm">
            {visitas.map((v) => (
              <div key={v.id}>
                {formatDateTime(v.fecha_inicio)} - {v.trabajos?.inmuebles?.clientes?.nombre ?? 'Cliente no disponible'} - {v.tipo} - {v.usuarios?.nombre ?? 'Sin técnico'}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
