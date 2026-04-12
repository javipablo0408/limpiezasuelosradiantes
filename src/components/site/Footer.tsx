import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start md:items-center">
            <img src="/logo.png" alt="T&V Servicios" className="h-14 w-auto object-contain" loading="lazy" decoding="async" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Contacto</div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-900">email</div>
                <div>Consultas@limpiezasuelosradiantes.com</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">teléfono</div>
                <div>689571381</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900">CIF</div>
                <div>B86715893</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">Enlaces internos</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link className="hover:text-slate-900" href="/privacidad">
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link className="hover:text-slate-900" href="/solicitar-presupuesto">
                  Presupuesto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
