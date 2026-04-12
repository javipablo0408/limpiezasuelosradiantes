'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatDate, formatEuro } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Empresa, EstadoFactura, Factura } from '@/types';

export default function FacturaDetallePage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [f, setF] = useState<Factura | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  useEffect(() => {
    supabase.from('facturas').select('*, factura_lineas(*), trabajos(*, inmuebles(*, clientes(*)))').eq('id', id).single().then(({ data }) => setF(data as Factura));
    supabase.from('empresa').select('*').limit(1).single().then(({ data }) => setEmpresa(data as Empresa));
  }, [id]);
  if (!f) return null;
  return <div className="space-y-3">
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6">
      <h2 className="text-xl font-semibold">Factura {f.numero}</h2>
      <p>{empresa?.nombre} · {empresa?.nif} · {empresa?.iban}</p>
      <p>Cliente: {f.trabajos?.inmuebles?.clientes?.nombre}</p>
      <p>Fecha: {formatDate(f.fecha)}</p>
      <table className="mt-4 w-full text-sm"><tbody>{(f.factura_lineas ?? []).map((l) => <tr key={l.id}><td>{l.descripcion}</td><td>{l.cantidad}</td><td>{formatEuro(l.precio_unitario)}</td><td className="text-right">{formatEuro(l.total)}</td></tr>)}</tbody></table>
      <div className="mt-4 text-right"><div>Subtotal {formatEuro(f.subtotal)}</div><div>IVA {formatEuro(f.iva)}</div><div className="text-xl font-bold">{formatEuro(f.total)}</div></div>
      <p className="mt-4 whitespace-pre-wrap text-xs">{empresa?.condiciones_pdf}</p>
    </div>
    <div className="no-print flex gap-2">
      <Select value={f.estado} onChange={async (e) => { const estado = e.target.value as EstadoFactura; await supabase.from('facturas').update({ estado }).eq('id', f.id); setF({ ...f, estado }); }}>
        <option value="emitida">emitida</option><option value="enviada">enviada</option><option value="pagada">pagada</option><option value="vencida">vencida</option><option value="anulada">anulada</option>
      </Select>
      <Button onClick={() => window.print()}>Imprimir</Button>
    </div>
  </div>;
}
