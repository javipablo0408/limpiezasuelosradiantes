export function Spinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center gap-3 text-[#8b949e]">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#30363d] border-t-teal-400" />
      <span>{text}</span>
    </div>
  );
}
