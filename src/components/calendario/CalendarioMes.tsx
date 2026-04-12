'use client';

import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMemo, useState } from 'react';
import type { Visita } from '@/types';

export function CalendarioMes({
  visitas,
  onDayClick
}: {
  visitas: Visita[];
  onDayClick: (day: Date, dayVisits: Visita[]) => void;
}) {
  const [month, setMonth] = useState(new Date());
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );

  const byDay = (day: Date) =>
    visitas.filter((v) => v.fecha_inicio && format(new Date(v.fecha_inicio), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={() => setMonth(addMonths(month, -1))}>←</button>
        <h3 className="font-semibold">{format(month, 'MMMM yyyy', { locale: es })}</h3>
        <button onClick={() => setMonth(addMonths(month, 1))}>→</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const dayVisits = byDay(d);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDayClick(d, dayVisits)}
              className="min-h-[90px] rounded-md border border-[#30363d] bg-[#161b22] p-2 text-left"
            >
              <div className="text-xs text-[#8b949e]">{format(d, 'dd')}</div>
              <div className="mt-1 space-y-1">
                {dayVisits.slice(0, 3).map((v) => (
                  <div key={v.id} className="rounded bg-cyan-500/20 px-1 text-xs">
                    {v.tipo}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
