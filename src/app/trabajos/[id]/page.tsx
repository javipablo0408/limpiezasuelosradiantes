'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { calcularPresupuesto } from '@/lib/calcularPresupuesto';
import { formatEuro, tipoServicioLabel, tipoVisitaLabel } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Cliente, EstadoTrabajo, Solicitud, TarifaTramo, Trabajo, Usuario, Visita } from '@/types';

const pipeline: EstadoTrabajo[] = ['visita1_pendiente', 'entre_visitas', 'visita2_pendiente', 'completado', 'cancelado'];

export default function TrabajoDetallePage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const modal = useModal();
  const toast = useToast();
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);
  const [clienteForm, setClienteForm] = useState<Partial<Cliente>>({});
  const [form, setForm] = useState({ tipo: 'prelavado', tecnico_id: '', fecha_inicio: '', notas_tecnico: '' });

  const resolvePdfUrl = (rawUrl: string) => {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    if (rawUrl.startsWith('/uploads/')) return rawUrl;
    if (rawUrl.startsWith('uploads/')) return `/${rawUrl}`;
    return `/uploads/${rawUrl}`;
  };

  const load = async () => {
    const [t, v, u] = await Promise.all([
      supabase.from('trabajos').select('*, inmuebles(*, clientes(*))').eq('id', id).single(),
      supabase.from('visitas').select('*, usuarios(*)').eq('trabajo_id', id).order('created_at', { ascending: false }),
      supabase.from('usuarios').select('*').eq('activo', true)
    ]);
    setTrabajo(t.data as Trabajo);
    if ((t.data as Trabajo | null)?.solicitud_id) {
      const s = await supabase
        .from('solicitudes')
        .select('*')
        .eq('id', (t.data as Trabajo).solicitud_id as string)
        .maybeSingle();
      setSolicitud((s.data as Solicitud) ?? null);
    } else {
      setSolicitud(null);
    }
    setClienteForm((t.data as Trabajo)?.inmuebles?.clientes ?? {});
    setVisitas((v.data as Visita[]) ?? []);
    setTecnicos((u.data as Usuario[]) ?? []);
  };
  useEffect(() => { load(); }, [id]);
  if (!trabajo) return null;
  const clienteId = trabajo.inmuebles?.clientes?.id;

  return <div className="space-y-4">
    <Card>
      <h3 className="mb-3 font-semibold">Datos del cliente</h3>
      <div className="grid gap-2 md:grid-cols-2">
        <Input placeholder="Nombre" value={clienteForm.nombre ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })} />
        <Input placeholder="Apellidos" value={clienteForm.apellidos ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, apellidos: e.target.value })} />
        <Input placeholder="Teléfono" value={clienteForm.telefono ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })} />
        <Input placeholder="Email" value={clienteForm.email ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} />
        <Input placeholder="NIF" value={clienteForm.nif ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, nif: e.target.value })} />
        <Input placeholder="Dirección fiscal" value={clienteForm.direccion ?? ''} onChange={(e) => setClienteForm({ ...clienteForm, direccion: e.target.value })} />
      </div>
      <div className="mt-3">
        <Button
          onClick={async () => {
            if (!clienteId) return toast.error('No se encontró el cliente del trabajo');
            const { error } = await supabase
              .from('clientes')
              .update({
                nombre: clienteForm.nombre,
                apellidos: clienteForm.apellidos,
                telefono: clienteForm.telefono,
                email: clienteForm.email,
                nif: clienteForm.nif,
                direccion: clienteForm.direccion
              })
              .eq('id', clienteId);
            if (error) return toast.error(error.message);
            toast.ok('Cliente actualizado');
            load();
          }}
        >
          Guardar datos del cliente
        </Button>
      </div>
    </Card>
    <Card>
      <h2 className="text-lg font-semibold">{trabajo.inmuebles?.clientes?.nombre} - {trabajo.inmuebles?.direccion}</h2>
      <div className="mt-2 flex gap-2"><Badge>{trabajo.estado}</Badge><Badge variant="info">{tipoServicioLabel(trabajo.tipo_servicio)}</Badge></div>
      <div className="mt-3 flex gap-2">
        {pipeline.map((s) => <Button key={s} size="sm" variant={s === trabajo.estado ? 'primary' : 'secondary'} onClick={async () => {
          await supabase.from('trabajos').update({ estado: s }).eq('id', id); setTrabajo({ ...trabajo, estado: s });
        }}>{s}</Button>)}
      </div>
    </Card>
    <Card>
      <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Visitas</h3><Button size="sm" onClick={modal.open}>+ Añadir visita</Button></div>
      {visitas.map((v) => <div key={v.id} className="mb-2 rounded border border-[#30363d] p-2 text-sm">{tipoVisitaLabel(v.tipo)} - {v.estado}</div>)}
    </Card>
    <Card>
      <h3 className="font-semibold">Presupuesto</h3>
      <p>
        Total:{' '}
        {trabajo.total != null
          ? formatEuro(trabajo.total)
          : solicitud?.precio_estimado != null
            ? `${formatEuro(solicitud.precio_estimado)} (estimado)`
            : 'Pendiente de cálculo'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={async () => {
            let lineas: Array<{ descripcion: string; precio: number }> = [];
            let calculoM2eq: number | null = null;
            let subtotalCalculado: number | null = null;
            let ivaCalculado: number | null = null;
            let totalCalculado: number | null = null;
            let tipoServicioCalculado: string | null = null;

            const inmueble = trabajo.inmuebles;
            if (inmueble?.m2 && inmueble?.provincia && inmueble?.antiguedad && inmueble?.ultima_limpieza) {
              const { data: tarifasData } = await supabase.from('tarifas_tramo').select('*');
              const tarifas = (tarifasData ?? []) as TarifaTramo[];
              if (tarifas.length > 0) {
                const calculo = calcularPresupuesto(
                  {
                    m2: Number(inmueble.m2),
                    tiene_deposito: Boolean(inmueble.tiene_deposito),
                    litros_deposito: Number(inmueble.litros_deposito ?? 0),
                    antiguedad: inmueble.antiguedad,
                    ultima_limpieza: inmueble.ultima_limpieza,
                    provincia: inmueble.provincia
                  },
                  tarifas,
                  trabajo.tipo_servicio
                );
                calculoM2eq = calculo.m2eq;
                subtotalCalculado = calculo.subtotal;
                ivaCalculado = calculo.iva;
                totalCalculado = calculo.total;
                tipoServicioCalculado = tipoServicioLabel(calculo.tipo);
                lineas = calculo.lineas.map((l) => ({ descripcion: l.descripcion, precio: l.precio }));
              }
            }

            if (lineas.length === 0) {
              lineas = [
                {
                  descripcion: `Servicio ${tipoServicioLabel(trabajo.tipo_servicio)}`,
                  precio: Number(trabajo.subtotal ?? solicitud?.precio_estimado ?? 0)
                }
              ];
            }

            const resp = await fetch(`/api/trabajos/${id}/presupuesto-pdf`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                numeroTrabajo: id,
                clienteNombre: `${clienteForm.nombre ?? ''} ${clienteForm.apellidos ?? ''}`.trim() || 'Cliente',
                clienteNif: clienteForm.nif ?? null,
                clienteDireccion: clienteForm.direccion ?? null,
                inmuebleDireccion: trabajo.inmuebles?.direccion ?? null,
                fecha: new Date().toLocaleDateString('es-ES'),
                subtotal: subtotalCalculado ?? trabajo.subtotal ?? solicitud?.precio_estimado ?? null,
                iva: ivaCalculado ?? trabajo.iva ?? null,
                total: totalCalculado ?? trabajo.total ?? solicitud?.precio_estimado ?? null,
                notas: trabajo.notas ?? null,
                tipoServicio: tipoServicioCalculado ?? tipoServicioLabel(trabajo.tipo_servicio),
                estadoTrabajo: trabajo.estado,
                esUrgente: trabajo.es_urgente,
                m2: trabajo.inmuebles?.m2 ?? null,
                m2eq: calculoM2eq ?? trabajo.m2_equivalentes ?? trabajo.inmuebles?.m2_equivalentes ?? null,
                tipoGenerador: trabajo.inmuebles?.tipo_generador ?? null,
                numColectores: trabajo.inmuebles?.num_colectores ?? null,
                antiguedad: trabajo.inmuebles?.antiguedad ?? null,
                ultimaLimpieza: trabajo.inmuebles?.ultima_limpieza ?? null,
                lineas
              })
            });
            const json = await resp.json();
            if (!resp.ok || !json?.ok) return toast.error(json?.error ?? 'No se pudo generar el PDF');
            const { error } = await supabase
              .from('trabajos')
              .update({ presupuesto_pdf_url: json.url })
              .eq('id', id);
            if (error) return toast.error(error.message);
            toast.ok('PDF de presupuesto generado');
            load();
          }}
        >
          Generar PDF
        </Button>
        {trabajo.presupuesto_pdf_url ? (
          <Button
            size="sm"
            onClick={() => {
              const target = resolvePdfUrl(trabajo.presupuesto_pdf_url ?? '');
              window.open(target, '_blank');
            }}
          >
            Ver PDF
          </Button>
        ) : null}
      </div>
    </Card>
    <Card><h3 className="font-semibold">Factura</h3><p>Sección vinculada por trabajo.</p></Card>
    <Card><h3 className="font-semibold">Informe</h3><p>Subida y consulta de PDF.</p></Card>
    <Modal open={modal.isOpen} onClose={modal.close} title="Nueva visita">
      <div className="grid gap-2">
        <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
          <option value="prelavado">Prelavado</option>
          <option value="lavado">Lavado</option>
          <option value="visita_aditivado">Visita de aditivado</option>
          <option value="limpieza_en_el_dia">Limpieza en el día</option>
          <option value="visita_anual">Visita anual</option>
        </Select>
        <Select value={form.tecnico_id} onChange={(e) => setForm({ ...form, tecnico_id: e.target.value })}><option value="">Sin técnico</option>{tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</Select>
        <input type="datetime-local" className="rounded border border-[#30363d] bg-[#0d1117] p-2" onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
        <Button onClick={async () => {
          await supabase.from('visitas').insert({ trabajo_id: id, tipo: form.tipo, tecnico_id: form.tecnico_id || null, fecha_inicio: form.fecha_inicio || null, fecha_fin: null, estado: 'pendiente', notas_tecnico: form.notas_tecnico || null });
          modal.close(); load();
        }}>Guardar</Button>
      </div>
    </Modal>
  </div>;
}
