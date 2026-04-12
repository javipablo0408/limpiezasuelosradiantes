import { Button } from './Button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#30363d] bg-[#161b22] p-8 text-center">
      <h3 className="text-base font-semibold text-[#e6edf3]">{title}</h3>
      {description ? <p className="mt-2 text-sm text-[#8b949e]">{description}</p> : null}
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
