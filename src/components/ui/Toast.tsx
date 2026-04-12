'use client';

import { useToast } from '@/hooks/useToast';

export function Toast() {
  const { items, remove } = useToast();
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2">
      {items.map((t) => (
        <button
          key={t.id}
          onClick={() => remove(t.id)}
          className={`block min-w-[260px] rounded-md border px-4 py-3 text-left text-sm ${
            t.type === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
              : t.type === 'error'
                ? 'border-red-500/40 bg-red-500/20 text-red-200'
                : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-200'
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
