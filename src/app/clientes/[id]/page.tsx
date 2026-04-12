'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Antiguedad, Cliente, Inmueble, TipoGenerador, UltimaLimpieza } from '@/types';

export default function ClienteDetallePage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const toast = useToast();
  const inmuebleModal = useModal();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [savingInmueble, setSavingInmueble] = useState(false);
  const [inmuebleForm, setInmuebleForm] = useState({
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    provincia: '',
    m2: '100',
    tipo_generador: 'caldera_gas' as TipoGenerador,
    tiene_deposito: false,
    litros_deposito: '0',
    num_colectores: '1',
    antiguedad: '5_7' as Antiguedad,
    ultima_limpieza: 'entre_1_3' as UltimaLimpieza,
    notas: ''
  });

  const loadInmuebles = useCallback(async () => {
    const { data, error } = await supabase.from('inmuebles').select('*').eq('cliente_id', id).order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setInmuebles((data as Inmueble[]) ?? []);
  }, [id, toast]);

  useEffect(() => {
    (async () => {
      const { data: clienteData } = await supabase.from('clientes').select('*').eq('id', id).single();
      setCliente(clienteData as Cliente);
      await loadInmuebles();
    })();
  }, [id, loadInmuebles]);

  const abrirNuevoInmueble = () => {
    setInmuebleForm({
      direccion: '',
      ciudad: '',
      codigo_postal: cliente?.codigo_postal ?? '',
      provincia: cliente?.provincia ?? '',
      m2: '100',
      tipo_generador: 'caldera_gas',
      tiene_deposito: false,
      litros_deposito: '0',
      num_colectores: '1',
      antiguedad: '5_7',
      ultima_limpieza: 'entre_1_3',
      notas: ''
    });
    inmuebleModal.open();
  };

  const guardarInmueble = async () => {
    const direccion = inmuebleForm.direccion.trim();
    const cp = inmuebleForm.codigo_postal.trim();
    const provincia = inmuebleForm.provincia.trim();
    if (!direccion || !cp || !provincia) {
      toast.error('Dirección, código postal y provincia son obligatorios');
      return;
    }
    const m2 = Number(inmuebleForm.m2);
    if (!Number.isFinite(m2) || m2 <= 0) {
      toast.error('m² no válido');
      return;
    }
    const numColectores = Math.max(1, parseInt(inmuebleForm.num_colectores, 10) || 1);
    const litros = inmuebleForm.tiene_deposito ? Math.max(0, Number(inmuebleForm.litros_deposito) || 0) : 0;

    setSavingInmueble(true);
    try {
      const { data, error } = await supabase
        .from('inmuebles')
        .insert({
          cliente_id: id,
          direccion,
          ciudad: inmuebleForm.ciudad.trim() || null,
          codigo_postal: cp,
          provincia,
          m2,
          tipo_generador: inmuebleForm.tipo_generador,
          tiene_deposito: inmuebleForm.tiene_deposito,
          litros_deposito: litros,
          num_colectores: numColectores,
          antiguedad: inmuebleForm.antiguedad,
          ultima_limpieza: inmuebleForm.ultima_limpieza,
          notas: inmuebleForm.notas.trim() || null
        })
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.ok('Inmueble creado');
      inmuebleModal.close();
      await loadInmuebles();
      if (data?.id) router.push(`/inmuebles/${data.id}`);
    } finally {
      setSavingInmueble(false);
    }
  };

  if (!cliente) return null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-2 md:grid-cols-2">
          <Input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} />
          <Input value={cliente.email ?? ''} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
          <Input value={cliente.nif ?? ''} onChange={(e) => setCliente({ ...cliente, nif: e.target.value })} />
          <Input value={cliente.direccion ?? ''} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} />
        </div>
        <div className="mt-2">
          <Button
            onClick={async () => {
              const { error } = await supabase
                .from('clientes')
                .update({ nombre: cliente.nombre, email: cliente.email, nif: cliente.nif, direccion: cliente.direccion })
                .eq('id', id);
              if (error) toast.error(error.message);
              else toast.ok('Cliente actualizado');
            }}
          >
            Guardar
          </Button>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#e6edf3]">Inmuebles</h3>
        <Button size="sm" type="button" onClick={abrirNuevoInmueble}>
          + Añadir inmueble
        </Button>
      </div>
      <Table columns={['Dirección', 'Ciudad', 'CP', 'm²', 'Generador', 'Creado']}>
        {inmuebles.map((i) => (
          <tr key={i.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">
              <Link href={`/inmuebles/${i.id}`}>{i.direccion}</Link>
            </td>
            <td className="px-3 py-2">{i.ciudad ?? '-'}</td>
            <td className="px-3 py-2">{i.codigo_postal}</td>
            <td className="px-3 py-2">{i.m2}</td>
            <td className="px-3 py-2">{i.tipo_generador}</td>
            <td className="px-3 py-2">{formatDate(i.created_at)}</td>
          </tr>
        ))}
      </Table>

      <Modal open={inmuebleModal.isOpen} onClose={inmuebleModal.close} title={`Nuevo inmueble — ${cliente.nombre}`}>
        <p className="mb-3 text-xs text-[#8b949e]">El inmueble quedará vinculado a este cliente.</p>
        <div className="grid max-h-[70vh] gap-2 overflow-y-auto text-sm md:grid-cols-2">
          <Input
            className="md:col-span-2"
            placeholder="Dirección del inmueble *"
            value={inmuebleForm.direccion}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, direccion: e.target.value })}
          />
          <Input placeholder="Ciudad" value={inmuebleForm.ciudad} onChange={(e) => setInmuebleForm({ ...inmuebleForm, ciudad: e.target.value })} />
          <Input
            placeholder="Código postal *"
            value={inmuebleForm.codigo_postal}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, codigo_postal: e.target.value })}
          />
          <Input
            className="md:col-span-2"
            placeholder="Provincia *"
            value={inmuebleForm.provincia}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, provincia: e.target.value })}
          />
          <Input type="number" min={1} placeholder="m² *" value={inmuebleForm.m2} onChange={(e) => setInmuebleForm({ ...inmuebleForm, m2: e.target.value })} />
          <Select
            value={inmuebleForm.tipo_generador}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, tipo_generador: e.target.value as TipoGenerador })}
          >
            <option value="caldera_gas">Caldera gas</option>
            <option value="aerotermia">Aerotermia</option>
            <option value="caldera_gasoil">Caldera gasoil</option>
            <option value="bomba_calor">Bomba de calor</option>
            <option value="otro">Otro</option>
          </Select>
          <Select
            value={inmuebleForm.tiene_deposito ? 'si' : 'no'}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, tiene_deposito: e.target.value === 'si' })}
          >
            <option value="no">Sin depósito inercia</option>
            <option value="si">Con depósito inercia</option>
          </Select>
          <Input
            type="number"
            min={0}
            placeholder="Litros depósito"
            value={inmuebleForm.litros_deposito}
            disabled={!inmuebleForm.tiene_deposito}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, litros_deposito: e.target.value })}
          />
          <Input
            type="number"
            min={1}
            placeholder="Nº colectores"
            value={inmuebleForm.num_colectores}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, num_colectores: e.target.value })}
          />
          <Select value={inmuebleForm.antiguedad} onChange={(e) => setInmuebleForm({ ...inmuebleForm, antiguedad: e.target.value as Antiguedad })}>
            <option value="menos_5">Menos de 5 años</option>
            <option value="5_7">5–7 años</option>
            <option value="8_12">8–12 años</option>
            <option value="13_mas">13 o más</option>
          </Select>
          <Select
            value={inmuebleForm.ultima_limpieza}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, ultima_limpieza: e.target.value as UltimaLimpieza })}
          >
            <option value="menos_1">Menos de 1 año</option>
            <option value="entre_1_3">1–3 años</option>
            <option value="entre_3_5">3–5 años</option>
            <option value="hace_5_mas">Hace más de 5 años</option>
            <option value="nunca">Nunca</option>
          </Select>
          <Input
            className="md:col-span-2"
            placeholder="Notas"
            value={inmuebleForm.notas}
            onChange={(e) => setInmuebleForm({ ...inmuebleForm, notas: e.target.value })}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={inmuebleModal.close}>
            Cancelar
          </Button>
          <Button type="button" disabled={savingInmueble} onClick={() => void guardarInmueble()}>
            {savingInmueble ? 'Guardando…' : 'Guardar inmueble'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
