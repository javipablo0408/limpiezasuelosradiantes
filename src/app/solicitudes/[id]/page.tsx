'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { CalculadorPresupuesto } from '@/components/presupuesto/CalculadorPresupuesto';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { formatDateTime } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Cliente, Solicitud } from '@/types';

export default function SolicitudDetallePage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const toast = useToast();
  const modal = useModal();
  const [sol, setSol] = useState<Solicitud | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [paso, setPaso] = useState(1);
  const [clienteId, setClienteId] = useState('');

  useEffect(() => {
    supabase.from('solicitudes').select('*').eq('id', id).single().then(({ data }) => setSol(data as Solicitud));
    supabase.from('clientes').select('*').eq('activo', true).order('nombre').then(({ data }) => setClientes((data as Cliente[]) ?? []));
  }, [id]);

  const normEmail = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const normTel = (s?: string | null) => (s ?? '').replace(/\s/g, '');

  if (!sol) return null;

  const buscarClienteIdEnBd = async (s: Solicitud): Promise<string | null> => {
    const email = normEmail(s.email);
    const telRaw = (s.telefono ?? '').trim();
    if (email) {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('activo', true)
        .ilike('email', email)
        .limit(1)
        .maybeSingle();
      if (!error && data?.id) return data.id as string;
    }
    if (telRaw) {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('activo', true)
        .eq('telefono', telRaw)
        .limit(1)
        .maybeSingle();
      if (!error && data?.id) return data.id as string;
    }
    return null;
  };

  const abrirModalCrearCliente = () => {
    const emailSol = normEmail(sol.email);
    const telSol = normTel(sol.telefono);
    const match = clientes.find(
      (c) =>
        (emailSol && normEmail(c.email) === emailSol) ||
        (telSol && normTel(c.telefono) === telSol)
    );
    setClienteId(match?.id ?? '');
    setPaso(1);
    modal.open();
  };
  const convertir = async () => {
    try {
      if (sol.trabajo_id) {
        toast.ok('Este presupuesto ya tiene un trabajo asociado');
        modal.close();
        router.push(`/trabajos/${sol.trabajo_id}`);
        return;
      }

      const forzarClienteNuevo = clienteId === '__new__';
      let selected = forzarClienteNuevo ? '' : clienteId.trim();
      if (!forzarClienteNuevo && !selected) {
        const emailSol = normEmail(sol.email);
        const telSol = normTel(sol.telefono);
        const fromList = clientes.find(
          (c) =>
            (emailSol && normEmail(c.email) === emailSol) ||
            (telSol && normTel(c.telefono) === telSol)
        );
        selected = fromList?.id ?? (await buscarClienteIdEnBd(sol)) ?? '';
      }
      if (!selected) {
        const created = await supabase
          .from('clientes')
          .insert({
            tipo: 'particular',
            nombre: sol.nombre,
            email: sol.email,
            telefono: sol.telefono,
            activo: true
          })
          .select('id')
          .single();
        if (created.error || !created.data?.id) {
          throw new Error(created.error?.message ?? 'No se pudo crear el cliente');
        }
        selected = created.data.id as string;
      }
      const inmueble = await supabase.from('inmuebles').insert({
        cliente_id: selected,
        direccion: 'Pendiente completar',
        codigo_postal: sol.codigo_postal,
        provincia: sol.provincia ?? '',
        m2: sol.m2,
        tipo_generador: sol.tipo_generador,
        tiene_deposito: sol.tiene_deposito,
        litros_deposito: sol.litros_deposito,
        num_colectores: 1,
        antiguedad: '5_7',
        ultima_limpieza: 'entre_1_3'
      }).select('id,m2_equivalentes').single();
      if (inmueble.error || !inmueble.data?.id) {
        throw new Error(inmueble.error?.message ?? 'No se pudo crear el inmueble');
      }
      const trabajo = await supabase.from('trabajos').insert({
        inmueble_id: inmueble.data.id,
        solicitud_id: sol.id,
        tipo_servicio: sol.tipo_servicio_calc ?? 'preventivo',
        es_urgente: sol.es_urgente,
        estado: 'visita1_pendiente',
        m2_equivalentes: inmueble.data.m2_equivalentes ?? sol.m2,
        iva: 21
      }).select('id').single();

      let trabajoId = trabajo.data?.id ?? null;
      if (trabajo.error) {
        throw new Error(trabajo.error.message);
      }
      if (!trabajoId) {
        const fallback = await supabase
          .from('trabajos')
          .select('id')
          .eq('solicitud_id', sol.id)
          .eq('inmueble_id', inmueble.data.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fallback.error) {
          throw new Error(fallback.error.message);
        }
        trabajoId = fallback.data?.id ?? null;
      }
      if (!trabajoId) {
        throw new Error('No se pudo crear/recuperar el trabajo');
      }

      await supabase.from('solicitudes').update({ estado: 'convertida', trabajo_id: trabajoId }).eq('id', sol.id);
      toast.ok('Cliente enlazado, inmueble y trabajo creados');
      router.push(`/trabajos/${trabajoId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error inesperado al convertir el presupuesto');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div><h2 className="text-lg font-semibold">{sol.nombre}</h2><p className="text-sm text-[#8b949e]">{formatDateTime(sol.created_at)}</p></div>
          <Badge variant="info">{sol.estado}</Badge>
        </div>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <div>Email: {sol.email}</div><div>Teléfono: {sol.telefono}</div><div>Provincia: {sol.provincia}</div>
          <div>m²: {sol.m2}</div><div>Depósito: {sol.tiene_deposito ? 'Sí' : 'No'}</div><div>Litros: {sol.litros_deposito}</div>
        </div>
      </Card>
      <Card>
        <CalculadorPresupuesto
          m2={sol.m2}
          tieneDeposito={sol.tiene_deposito}
          litrosDeposito={sol.litros_deposito}
          antiguedad={'5_7'}
          ultimaLimpieza={'entre_1_3'}
          provincia={sol.provincia ?? ''}
        />
      </Card>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {sol.trabajo_id ? (
            <Button variant="secondary" onClick={() => router.push(`/trabajos/${sol.trabajo_id}`)}>
              Ver trabajo
            </Button>
          ) : (
            <Button onClick={abrirModalCrearCliente}>Crear cliente</Button>
          )}
        </div>
        {!sol.trabajo_id ? (
          <p className="max-w-2xl text-xs leading-relaxed text-[#8b949e]">
            Si el presupuesto es de un cliente antiguo que ya está en el panel (mismo email o teléfono), no se crea
            otra ficha de cliente: se reutiliza la existente y solo se generan el inmueble y el trabajo para este
            presupuesto. Si el contacto no coincide (email distinto, otro familiar, etc.), elegid otro cliente en el
            desplegable o usad «Crear cliente nuevo siempre».
          </p>
        ) : null}
      </div>
      <Modal open={modal.isOpen} onClose={modal.close} title="Crear cliente">
        <div className="space-y-3 text-sm">
          <div>Paso {paso} de 3</div>
          {paso === 1 && (
            <div className="space-y-2">
              <p className="text-[#8b949e]">
                Si ya existe un cliente con el mismo email o teléfono, se usará ese registro. Puedes elegir otro manualmente o forzar cliente nuevo.
              </p>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Usar cliente existente si coincide (email o teléfono)</option>
                <option value="__new__">Crear cliente nuevo siempre</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.email ? ` — ${c.email}` : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {paso === 2 && <div>Se creará un inmueble con los datos de este presupuesto vinculado al cliente elegido.</div>}
          {paso === 3 && <div>Confirmar: se crea el trabajo y el presupuesto pasa a convertido.</div>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={modal.close}>Cancelar</Button>
            {paso < 3 ? <Button onClick={() => setPaso((p) => p + 1)}>Siguiente</Button> : <Button onClick={convertir}>Confirmar</Button>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
