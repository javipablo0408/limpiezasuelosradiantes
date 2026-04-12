'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { calcularPresupuesto } from '@/lib/calcularPresupuesto';
import { formatDate, formatDateTime, formatEuro, tipoServicioLabel } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Inmueble, TarifaTramo, TipoServicio, Trabajo, Visita } from '@/types';

export default function InmuebleDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const toast = useToast();
  const trabajoModal = useModal();
  const [inmueble, setInmueble] = useState<Inmueble | null>(null);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [savingTrabajo, setSavingTrabajo] = useState(false);
  const [trabajoForm, setTrabajoForm] = useState({ tipo_servicio: 'preventivo' as TipoServicio, es_urgente: false });

  const load = useCallback(async () => {
    const inmuebleRes = await supabase.from('inmuebles').select('*, clientes(*)').eq('id', id).single();
    const trabajosRes = await supabase.from('trabajos').select('*').eq('inmueble_id', id).order('created_at', { ascending: false });
    const list = (trabajosRes.data as Trabajo[]) ?? [];
    const trabajoIds = list.map((t) => t.id);
    const visitasRes = trabajoIds.length
      ? await supabase.from('visitas').select('*').in('trabajo_id', trabajoIds).order('fecha_inicio', { ascending: false })
      : { data: [] };
    if (inmuebleRes.error) toast.error(inmuebleRes.error.message);
    setInmueble(inmuebleRes.data as Inmueble);
    setTrabajos(list);
    setVisitas((visitasRes.data as Visita[]) ?? []);
  }, [id, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const abrirCrearTrabajo = async () => {
    if (!inmueble) return;
    const { data: tarifasData } = await supabase.from('tarifas_tramo').select('*');
    const tarifas = (tarifasData ?? []) as TarifaTramo[];
    let tipo: TipoServicio = 'preventivo';
    if (tarifas.length > 0) {
      const r = calcularPresupuesto(
        {
          m2: Number(inmueble.m2),
          tiene_deposito: Boolean(inmueble.tiene_deposito),
          litros_deposito: Number(inmueble.litros_deposito ?? 0),
          antiguedad: inmueble.antiguedad,
          ultima_limpieza: inmueble.ultima_limpieza,
          provincia: inmueble.provincia
        },
        tarifas
      );
      tipo = r.tipo;
    }
    setTrabajoForm({ tipo_servicio: tipo, es_urgente: false });
    trabajoModal.open();
  };

  const guardarTrabajo = async () => {
    if (!inmueble) return;
    setSavingTrabajo(true);
    try {
      const m2eq = Number(inmueble.m2_equivalentes ?? inmueble.m2);
      const { data, error } = await supabase
        .from('trabajos')
        .insert({
          inmueble_id: id,
          tipo_servicio: trabajoForm.tipo_servicio,
          es_urgente: trabajoForm.es_urgente,
          estado: 'visita1_pendiente',
          m2_equivalentes: Number.isFinite(m2eq) ? m2eq : inmueble.m2,
          iva: 21
        })
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.ok('Trabajo creado');
      trabajoModal.close();
      await load();
      if (data?.id) router.push(`/trabajos/${data.id}`);
    } finally {
      setSavingTrabajo(false);
    }
  };

  if (!inmueble) return null;
  const trabajoById = new Map(trabajos.map((t) => [t.id, t]));

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">{inmueble.direccion}</h2>
        <p className="mt-2 text-sm">
          {inmueble.clientes?.nombre} · {inmueble.codigo_postal} · {inmueble.provincia}
        </p>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Trabajos</h3>
        <Button size="sm" type="button" onClick={() => void abrirCrearTrabajo()}>
          + Crear trabajo
        </Button>
      </div>
      <Table columns={['Servicio', 'Estado', 'Urgente', 'Total', 'Creado', '']}>
        {trabajos.map((t) => (
          <tr key={t.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">{tipoServicioLabel(t.tipo_servicio)}</td>
            <td className="px-3 py-2">
              <Badge>{t.estado}</Badge>
            </td>
            <td className="px-3 py-2">{t.es_urgente ? <Badge variant="warning">Sí</Badge> : 'No'}</td>
            <td className="px-3 py-2">{t.total != null ? formatEuro(t.total) : '-'}</td>
            <td className="px-3 py-2">{formatDate(t.created_at)}</td>
            <td className="px-3 py-2 text-right">
              <Link className="text-sm text-teal-400 hover:underline" href={`/trabajos/${t.id}`}>
                Ver
              </Link>
            </td>
          </tr>
        ))}
      </Table>
      {trabajos.length === 0 ? <p className="text-xs text-[#8b949e]">No hay trabajos para este inmueble. Crea uno para agendar visitas y presupuesto.</p> : null}

      <h3 className="text-sm font-semibold text-[#e6edf3]">Visitas</h3>
      <Table columns={['Fecha visita', 'Tipo visita', 'Estado visita', 'Trabajo realizado', 'Estado trabajo', 'Total']}>
        {visitas.map((v) => {
          const t = trabajoById.get(v.trabajo_id);
          return (
            <tr key={v.id} className="border-b border-[#30363d]">
              <td className="px-3 py-2">{formatDateTime(v.fecha_inicio)}</td>
              <td className="px-3 py-2">{v.tipo}</td>
              <td className="px-3 py-2">{v.estado}</td>
              <td className="px-3 py-2">{tipoServicioLabel(t?.tipo_servicio)}</td>
              <td className="px-3 py-2">{t?.estado ?? '-'}</td>
              <td className="px-3 py-2">{t?.total != null ? formatEuro(t.total) : '-'}</td>
            </tr>
          );
        })}
      </Table>
      {visitas.length === 0 ? <p className="text-xs text-[#8b949e]">Sin visitas aún.</p> : null}

      <Modal open={trabajoModal.isOpen} onClose={trabajoModal.close} title="Nuevo trabajo">
        <p className="mb-3 text-xs text-[#8b949e]">
          Se crea un trabajo para este inmueble. El tipo de servicio sugerido viene del cálculo de tarifas; puedes cambiarlo.
        </p>
        <div className="grid gap-3 text-sm">
          <Select value={trabajoForm.tipo_servicio} onChange={(e) => setTrabajoForm({ ...trabajoForm, tipo_servicio: e.target.value as TipoServicio })}>
            <option value="preventivo">Tratamiento preventivo</option>
            <option value="prelavado_lavado">Con prelavado</option>
            <option value="intensiva_dia">Intensiva 1 día</option>
          </Select>
          <label className="flex items-center gap-2 text-[#e6edf3]">
            <input
              type="checkbox"
              checked={trabajoForm.es_urgente}
              onChange={(e) => setTrabajoForm({ ...trabajoForm, es_urgente: e.target.checked })}
              className="rounded border-[#30363d]"
            />
            Urgente
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={trabajoModal.close}>
            Cancelar
          </Button>
          <Button type="button" disabled={savingTrabajo} onClick={() => void guardarTrabajo()}>
            {savingTrabajo ? 'Creando…' : 'Crear trabajo'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
