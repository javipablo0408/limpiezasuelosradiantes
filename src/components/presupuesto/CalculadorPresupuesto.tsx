'use client';

import { useEffect, useMemo, useState } from 'react';
import { calcularPresupuesto } from '@/lib/calcularPresupuesto';
import { formatEuro, tipoServicioLabel } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
import type { Antiguedad, TarifaTramo, UltimaLimpieza } from '@/types';

export function CalculadorPresupuesto({
  m2,
  tieneDeposito,
  litrosDeposito,
  antiguedad,
  ultimaLimpieza,
  provincia
}: {
  m2: number;
  tieneDeposito: boolean;
  litrosDeposito: number;
  antiguedad: Antiguedad;
  ultimaLimpieza: UltimaLimpieza;
  provincia: string;
}) {
  const [tarifas, setTarifas] = useState<TarifaTramo[]>([]);

  useEffect(() => {
    supabase.from('tarifas_tramo').select('*').then(({ data }) => setTarifas((data as TarifaTramo[]) ?? []));
  }, []);

  const result = useMemo(
    () =>
      calcularPresupuesto(
        {
          m2,
          tiene_deposito: tieneDeposito,
          litros_deposito: litrosDeposito,
          antiguedad,
          ultima_limpieza: ultimaLimpieza,
          provincia
        },
        tarifas
      ),
    [m2, tieneDeposito, litrosDeposito, antiguedad, ultimaLimpieza, provincia, tarifas]
  );

  return (
    <div className="space-y-2 text-sm">
      <div>Tipo: <strong>{tipoServicioLabel(result.tipo)}</strong></div>
      <div>m² equivalentes: <strong>{result.m2eq}</strong></div>
      {result.lineas.map((l) => (
        <div key={l.descripcion} className="flex justify-between">
          <span>{l.descripcion}</span><span>{formatEuro(l.precio)}</span>
        </div>
      ))}
      <hr className="border-[#30363d]" />
      <div className="flex justify-between"><span>Subtotal</span><span>{formatEuro(result.subtotal)}</span></div>
      <div className="flex justify-between"><span>IVA 21%</span><span>{formatEuro(result.iva)}</span></div>
      <div className="flex justify-between font-semibold"><span>Total</span><span>{formatEuro(result.total)}</span></div>
    </div>
  );
}
