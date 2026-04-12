'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { CalculadorPresupuesto } from '@/components/presupuesto/CalculadorPresupuesto';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { Antiguedad, Cliente, Inmueble, TipoGenerador, UltimaLimpieza } from '@/types';

function InmueblesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const calcModal = useModal();
  const nuevoModal = useModal();
  const [rows, setRows] = useState<Inmueble[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [q, setQ] = useState('');
  const [selectedCalc, setSelectedCalc] = useState<Inmueble | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cliente_id: '',
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

  const load = () => {
    supabase
      .from('inmuebles')
      .select('*, clientes(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRows((data as Inmueble[]) ?? []);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => setClientes((data as Cliente[]) ?? []));
  }, []);

  const data = useMemo(
    () => rows.filter((r) => `${r.direccion} ${r.clientes?.nombre ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const abrirNuevo = useCallback(() => {
    setForm({
      cliente_id: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      provincia: '',
      m2: '100',
      tipo_generador: 'caldera_gas',
      tiene_deposito: false,
      litros_deposito: '0',
      num_colectores: '1',
      antiguedad: '5_7',
      ultima_limpieza: 'entre_1_3',
      notas: ''
    });
    nuevoModal.open();
  }, [nuevoModal.open]);

  useEffect(() => {
    if (searchParams?.get('nuevo') === '1') {
      abrirNuevo();
      router.replace('/inmuebles', { scroll: false });
    }
  }, [searchParams, router, abrirNuevo]);

  const guardarNuevo = async () => {
    if (!form.cliente_id) {
      toast.error('Selecciona un cliente');
      return;
    }
    const direccion = form.direccion.trim();
    const cp = form.codigo_postal.trim();
    const provincia = form.provincia.trim();
    if (!direccion || !cp || !provincia) {
      toast.error('Dirección, código postal y provincia son obligatorios');
      return;
    }
    const m2 = Number(form.m2);
    if (!Number.isFinite(m2) || m2 <= 0) {
      toast.error('m² no válido');
      return;
    }
    const numColectores = Math.max(1, parseInt(form.num_colectores, 10) || 1);
    const litros = form.tiene_deposito ? Math.max(0, Number(form.litros_deposito) || 0) : 0;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('inmuebles')
        .insert({
          cliente_id: form.cliente_id,
          direccion,
          ciudad: form.ciudad.trim() || null,
          codigo_postal: cp,
          provincia,
          m2,
          tipo_generador: form.tipo_generador,
          tiene_deposito: form.tiene_deposito,
          litros_deposito: litros,
          num_colectores: numColectores,
          antiguedad: form.antiguedad,
          ultima_limpieza: form.ultima_limpieza,
          notas: form.notas.trim() || null
        })
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.ok('Inmueble creado');
      nuevoModal.close();
      load();
      if (data?.id) router.push(`/inmuebles/${data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar dirección o cliente" />
        <Button type="button" onClick={abrirNuevo}>
          + Nuevo inmueble
        </Button>
      </div>
      <Table columns={['Cliente', 'Dirección', 'm²', 'm2 eq', 'Generador', 'Madrid', 'Antigüedad', 'Última limpieza', '']}>
        {data.map((i) => (
          <tr key={i.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">{i.clientes?.nombre ?? '-'}</td>
            <td className="px-3 py-2">
              <Link href={`/inmuebles/${i.id}`}>{i.direccion}</Link>
            </td>
            <td className="px-3 py-2">{i.m2}</td>
            <td className="px-3 py-2">{i.m2_equivalentes}</td>
            <td className="px-3 py-2">{i.tipo_generador}</td>
            <td className="px-3 py-2">{i.es_comunidad_madrid ? 'Sí' : 'No'}</td>
            <td className="px-3 py-2">{i.antiguedad}</td>
            <td className="px-3 py-2">{i.ultima_limpieza}</td>
            <td className="px-3 py-2">
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  setSelectedCalc(i);
                  calcModal.open();
                }}
              >
                Calcular
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={calcModal.isOpen} onClose={calcModal.close} title="Resultado cálculo">
        {selectedCalc ? (
          <CalculadorPresupuesto
            m2={selectedCalc.m2}
            tieneDeposito={selectedCalc.tiene_deposito}
            litrosDeposito={selectedCalc.litros_deposito}
            antiguedad={selectedCalc.antiguedad}
            ultimaLimpieza={selectedCalc.ultima_limpieza}
            provincia={selectedCalc.provincia}
          />
        ) : null}
      </Modal>

      <Modal open={nuevoModal.isOpen} onClose={nuevoModal.close} title="Nuevo inmueble">
        <div className="grid max-h-[70vh] gap-2 overflow-y-auto text-sm md:grid-cols-2">
          <Select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
            <option value="">Cliente *</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellidos ?? ''}
              </option>
            ))}
          </Select>
          <div />
          <Input
            className="md:col-span-2"
            placeholder="Dirección *"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
          <Input placeholder="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
          <Input placeholder="Código postal *" value={form.codigo_postal} onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
          <Input className="md:col-span-2" placeholder="Provincia *" value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
          <Input type="number" min={1} placeholder="m² *" value={form.m2} onChange={(e) => setForm({ ...form, m2: e.target.value })} />
          <Select value={form.tipo_generador} onChange={(e) => setForm({ ...form, tipo_generador: e.target.value as TipoGenerador })}>
            <option value="caldera_gas">Caldera gas</option>
            <option value="aerotermia">Aerotermia</option>
            <option value="caldera_gasoil">Caldera gasoil</option>
            <option value="bomba_calor">Bomba de calor</option>
            <option value="otro">Otro</option>
          </Select>
          <Select
            value={form.tiene_deposito ? 'si' : 'no'}
            onChange={(e) => setForm({ ...form, tiene_deposito: e.target.value === 'si' })}
          >
            <option value="no">Sin depósito inercia</option>
            <option value="si">Con depósito inercia</option>
          </Select>
          <Input
            type="number"
            min={0}
            placeholder="Litros depósito"
            value={form.litros_deposito}
            disabled={!form.tiene_deposito}
            onChange={(e) => setForm({ ...form, litros_deposito: e.target.value })}
          />
          <Input
            type="number"
            min={1}
            placeholder="Nº colectores"
            value={form.num_colectores}
            onChange={(e) => setForm({ ...form, num_colectores: e.target.value })}
          />
          <Select value={form.antiguedad} onChange={(e) => setForm({ ...form, antiguedad: e.target.value as Antiguedad })}>
            <option value="menos_5">Menos de 5 años</option>
            <option value="5_7">5–7 años</option>
            <option value="8_12">8–12 años</option>
            <option value="13_mas">13 o más</option>
          </Select>
          <Select value={form.ultima_limpieza} onChange={(e) => setForm({ ...form, ultima_limpieza: e.target.value as UltimaLimpieza })}>
            <option value="menos_1">Menos de 1 año</option>
            <option value="entre_1_3">1–3 años</option>
            <option value="entre_3_5">3–5 años</option>
            <option value="hace_5_mas">Hace más de 5 años</option>
            <option value="nunca">Nunca</option>
          </Select>
          <Input className="md:col-span-2" placeholder="Notas" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={nuevoModal.close}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving} onClick={() => void guardarNuevo()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function InmueblesPage() {
  return (
    <Suspense fallback={<Spinner text="Cargando inmuebles…" />}>
      <InmueblesPageInner />
    </Suspense>
  );
}
