'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useModal } from '@/hooks/useModal';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { Cliente, TipoCliente } from '@/types';

function ClientesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modal = useModal();
  const toast = useToast();
  const [rows, setRows] = useState<Cliente[]>([]);
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: 'particular' as TipoCliente,
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    nif: '',
    direccion: '',
    ciudad: '',
    codigo_postal: '',
    provincia: ''
  });

  const load = () => {
    supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setRows((data as Cliente[]) ?? []);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  useEffect(() => {
    if (searchParams?.get('nuevo') === '1') {
      modal.open();
      router.replace('/clientes', { scroll: false });
    }
  }, [searchParams, router, modal.open]);

  const data = useMemo(
    () => rows.filter((c) => `${c.nombre} ${c.apellidos ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  const abrirNuevo = () => {
    setForm({
      tipo: 'particular',
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      nif: '',
      direccion: '',
      ciudad: '',
      codigo_postal: '',
      provincia: ''
    });
    modal.open();
  };

  const guardar = async () => {
    const nombre = form.nombre.trim();
    if (!nombre) {
      toast.error('Indica al menos el nombre');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          tipo: form.tipo,
          nombre,
          apellidos: form.apellidos.trim() || null,
          email: form.email.trim() || null,
          telefono: form.telefono.trim() || null,
          nif: form.nif.trim() || null,
          direccion: form.direccion.trim() || null,
          ciudad: form.ciudad.trim() || null,
          codigo_postal: form.codigo_postal.trim() || null,
          provincia: form.provincia.trim() || null,
          activo: true
        })
        .select('id')
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.ok('Cliente creado');
      modal.close();
      load();
      if (data?.id) router.push(`/clientes/${data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente" />
        <Button type="button" onClick={abrirNuevo}>
          + Nuevo cliente
        </Button>
      </div>
      <Table columns={['Tipo', 'Cliente', 'NIF', 'Dirección de facturación', 'Teléfono', 'Email', 'Activo']}>
        {data.map((c) => (
          <tr key={c.id} className="border-b border-[#30363d]">
            <td className="px-3 py-2">
              <Badge variant="info">{c.tipo}</Badge>
            </td>
            <td className="px-3 py-2">
              <Link href={`/clientes/${c.id}`}>
                {c.nombre} {c.apellidos ?? ''}
              </Link>
            </td>
            <td className="px-3 py-2">{c.nif ?? '-'}</td>
            <td className="px-3 py-2">{[c.direccion, c.ciudad, c.codigo_postal].filter(Boolean).join(', ') || '-'}</td>
            <td className="px-3 py-2">{c.telefono ?? '-'}</td>
            <td className="px-3 py-2">{c.email ?? '-'}</td>
            <td className="px-3 py-2">
              {c.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="gray">Inactivo</Badge>}
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={modal.isOpen} onClose={modal.close} title="Nuevo cliente">
        <div className="grid max-h-[70vh] gap-2 overflow-y-auto text-sm md:grid-cols-2">
          <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCliente })}>
            <option value="particular">Particular</option>
            <option value="promotora">Promotora</option>
            <option value="empresa">Empresa</option>
          </Select>
          <div />
          <Input placeholder="Nombre *" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input placeholder="Apellidos" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input placeholder="NIF" value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
          <Input placeholder="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          <Input placeholder="Ciudad" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
          <Input placeholder="Código postal" value={form.codigo_postal} onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
          <Input placeholder="Provincia" value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={modal.close}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving} onClick={() => void guardar()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<Spinner text="Cargando clientes…" />}>
      <ClientesPageInner />
    </Suspense>
  );
}
