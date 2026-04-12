'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatEuro } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { EstadoSolicitud, Solicitud } from '@/types';

const estadoUiToDb: Record<'aceptado' | 'en_espera' | 'rechazada', EstadoSolicitud> = {
  aceptado: 'convertida',
  en_espera: 'en_contacto',
  rechazada: 'descartada'
};

const estadoDbToUi = (estado: EstadoSolicitud): 'aceptado' | 'en_espera' | 'rechazada' => {
  if (estado === 'convertida') return 'aceptado';
  if (estado === 'descartada') return 'rechazada';
  return 'en_espera';
};

export default function SolicitudesPage() {
  const router = useRouter();
  const [data, setData] = useState<Solicitud[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    supabase.from('solicitudes').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message);
      setData((data as Solicitud[]) ?? []);
      setLoading(false);
    });
  }, [toast]);

  const filtered = useMemo(() => data.filter((s) =>
    [s.nombre, s.email, s.telefono, s.provincia].join(' ').toLowerCase().includes(q.toLowerCase())
  ), [data, q]);

  const setEstado = async (id: string, uiEstado: 'aceptado' | 'en_espera' | 'rechazada') => {
    const estado = estadoUiToDb[uiEstado];
    const { error } = await supabase.from('solicitudes').update({ estado }).eq('id', id);
    if (error) toast.error(error.message);
    setData((curr) => curr.map((x) => (x.id === id ? { ...x, estado } : x)));
  };

  if (loading) return <Spinner />;
  return (
    <div className="space-y-3">
      <Input placeholder="Buscar presupuesto por nombre, email, teléfono..." value={q} onChange={(e) => setQ(e.target.value)} />
      <Table columns={['Nombre', 'Email', 'Teléfono', 'm²', 'Provincia', 'Urgente', 'Precio', 'Estado', 'Fecha', 'Acciones']}>
        {filtered.map((s) => (
          <tr key={s.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">{s.nombre}</td>
            <td className="px-3 py-2">{s.email}</td>
            <td className="px-3 py-2">{s.telefono}</td>
            <td className="px-3 py-2">{s.m2}</td>
            <td className="px-3 py-2">{s.provincia ?? '-'}</td>
            <td className="px-3 py-2">{s.es_urgente ? <Badge variant="warning">Urgente</Badge> : '-'}</td>
            <td className="px-3 py-2">{formatEuro(s.precio_estimado ?? 0)}</td>
            <td className="px-3 py-2">
              <Select value={estadoDbToUi(s.estado)} onChange={(e) => setEstado(s.id, e.target.value as 'aceptado' | 'en_espera' | 'rechazada')}>
                <option value="aceptado">aceptado</option>
                <option value="en_espera">en espera</option>
                <option value="rechazada">rechazada</option>
              </Select>
            </td>
            <td className="px-3 py-2">{formatDate(s.created_at)}</td>
            <td className="px-3 py-2 text-right">
              <Button size="sm" variant="secondary" type="button" onClick={() => router.push(`/solicitudes/${s.id}`)}>
                Ver más
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
