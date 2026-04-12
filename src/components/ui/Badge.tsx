import type { ReactNode } from 'react';
import { estadoLabel } from '@/lib/formatters';

type Variant = 'success' | 'warning' | 'info' | 'danger' | 'gray';

const styles: Record<Variant, string> = {
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  gray: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
};

export function Badge({
  children,
  variant = 'gray'
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${styles[variant]}`}>
      {typeof children === 'string' ? estadoLabel(children as never) : children}
    </span>
  );
}
