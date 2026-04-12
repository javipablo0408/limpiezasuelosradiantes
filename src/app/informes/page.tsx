'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { InformeServicio, Trabajo, Visita } from '@/types';

export default function InformesPage() {
  const modal = useModal();
  const toast = useToast();
  const [rows, setRows] = useState<InformeServicio[]>([]);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [form, setForm] = useState({ trabajo_id: '', visita_id: '', pdf_url: '', fecha: '', notas: '' });

  const trabajoLabel = (id: string) => {
    const t = trabajos.find((x) => x.id === id);
    return t ? `${t.inmuebles?.clientes?.nombre ?? 'Cliente'} - ${t.inmuebles?.direccion ?? 'Dirección'}` : 'Trabajo no encontrado';
  };

  const load = async () => {
    const [i, t, v] = await Promise.all([
      supabase.from('informes_servicio').select('*').order('fecha', { ascending: false }),
      supabase.from('trabajos').select('*, inmuebles(*, clientes(*))').eq('estado', 'completado'),
      supabase.from('visitas').select('*')
    ]);
    if (i.error || t.error || v.error) {
      toast.error(i.error?.message ?? t.error?.message ?? v.error?.message ?? 'Error cargando informes');
    }
    setRows((i.data as InformeServicio[]) ?? []);
    setTrabajos((t.data as Trabajo[]) ?? []);
    setVisitas((v.data as Visita[]) ?? []);
  };
  useEffect(() => { load(); }, []);
  return <div className="space-y-3">
    <Button onClick={modal.open}>+ Subir informe</Button>
    <Table columns={['Trabajo', 'Visita', 'Fecha', 'PDF']}>
      {rows.map((r) => <tr key={r.id} className="border-b border-[#30363d]"><td className="px-3 py-2">{trabajoLabel(r.trabajo_id)}</td><td className="px-3 py-2">{r.visita_id ? `Visita vinculada` : '-'}</td><td className="px-3 py-2">{formatDate(r.fecha)}</td><td className="px-3 py-2">{r.pdf_url ? <Badge variant="success">Sí</Badge> : <Badge>No</Badge>}</td></tr>)}
    </Table>
    <Modal open={modal.isOpen} onClose={modal.close} title="Subir informe">
      <div className="space-y-2">
        <Select value={form.trabajo_id} onChange={(e) => setForm({ ...form, trabajo_id: e.target.value, visita_id: '' })}><option value="">Selecciona trabajo completado</option>{trabajos.map((t) => <option key={t.id} value={t.id}>{t.inmuebles?.clientes?.nombre} - {t.inmuebles?.direccion}</option>)}</Select>
        <Select value={form.visita_id} onChange={(e) => setForm({ ...form, visita_id: e.target.value })}><option value="">Selecciona visita</option>{visitas.filter((v) => v.trabajo_id === form.trabajo_id).map((v) => <option key={v.id} value={v.id}>{v.tipo}</option>)}</Select>
        <input type="file" className="w-full text-sm" onChange={(e) => setForm({ ...form, pdf_url: e.target.files?.[0]?.name ?? '' })} />
        <input type="date" className="w-full rounded border border-[#30363d] bg-[#0d1117] p-2" onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        <Button onClick={async () => {
          if (!form.trabajo_id) return toast.error('Selecciona un trabajo completado');
          if (!form.fecha) return toast.error('Selecciona una fecha');
          const payload = {
            trabajo_id: form.trabajo_id,
            visita_id: form.visita_id || null,
            pdf_url: form.pdf_url || null,
            fecha: form.fecha,
            notas: form.notas || null
          };
          const { error } = await supabase.from('informes_servicio').insert(payload);
          if (error) return toast.error(error.message);
          toast.ok('Informe guardado');
          modal.close();
          setForm({ trabajo_id: '', visita_id: '', pdf_url: '', fecha: '', notas: '' });
          load();
        }}>Guardar</Button>
      </div>
    </Modal>
  </div>;
}
