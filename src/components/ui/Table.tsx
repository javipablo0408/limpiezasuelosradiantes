import type { ReactNode } from 'react';

export function Table({
  columns,
  children
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22]">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#21262d]">
            <tr>
              {columns.map((c) => (
                <th key={c} className="border-b border-[#30363d] px-3 py-2 text-left font-medium text-[#8b949e]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:hover]:bg-[#21262d]">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
