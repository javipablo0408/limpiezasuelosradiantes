import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
          <img src="/logo.png" alt="T&V Servicios" className="h-10 w-auto object-contain" loading="eager" decoding="async" />
        </Link>

        <nav className="justify-self-center">
          <div className="hidden items-center gap-6 text-xs font-semibold text-slate-700 md:flex">
            <Link href="/domotica" className="hover:text-slate-900">
              Domótica
            </Link>
            <Link href="/instalacion-suelo-radiante" className="hover:text-slate-900">
              Suelo radiante
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Panel
            </Link>
          </div>
        </nav>

        <div className="justify-self-end">
          <Link
            href="/solicitar-presupuesto"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-brand-orange-600)] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--color-brand-orange-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-orange-500)] focus:ring-offset-2"
          >
            Solicitar Presupuesto
          </Link>
        </div>
      </div>
    </header>
  );
}
