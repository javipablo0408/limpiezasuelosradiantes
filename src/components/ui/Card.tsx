import type { ReactNode } from 'react';

export function Card({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`rounded-xl border border-[#30363d] bg-[#161b22] p-4 ${className}`}>{children}</div>;
}
