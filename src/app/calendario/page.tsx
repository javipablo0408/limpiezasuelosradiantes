'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/components/auth/AdminShell';
import { CalendarioMes } from '@/components/calendario/CalendarioMes';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useModal } from '@/hooks/useModal';
import { formatDateTime } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Visita } from '@/types';

export default function CalendarioPage() {
  const { role, usuarioId } = useAdminAuth();
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [dia, setDia] = useState<Visita[]>([]);
  const modal = useModal();
  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from('visitas')
        .select('*, usuarios(*), trabajos(*, inmuebles(*, clientes(*)))')
        .order('fecha_inicio');
      if (role === 'tecnico' && usuarioId) {
        query = query.eq('tecnico_id', usuarioId);
      }
      const { data } = await query;
      setVisitas((data as Visita[]) ?? []);
    };
    void load();
  }, [role, usuarioId]);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card><CalendarioMes visitas={visitas} onDayClick={(_, dayVisits) => { setDia(dayVisits); modal.open(); }} /></Card>
      <Card><h3 className="mb-2 font-semibold">Próximas 8 visitas</h3>{visitas.slice(0, 8).map((v) => <div key={v.id} className="mb-2 text-sm">{formatDateTime(v.fecha_inicio)} - {v.tipo}</div>)}</Card>
      <Modal open={modal.isOpen} onClose={modal.close} title="Visitas del día">{dia.map((v) => <div key={v.id} className="mb-2 rounded border border-[#30363d] p-2 text-sm">{v.tipo} - {v.estado}</div>)}</Modal>
    </div>
  );
}
