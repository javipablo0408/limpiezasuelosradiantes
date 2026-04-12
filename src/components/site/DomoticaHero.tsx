export function DomoticaHero() {
  return (
    <section className="relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(29,78,216,0.10),transparent_65%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full bg-[var(--color-brand-blue-50)] px-4 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-brand-blue-700)]">
            Domótica avanzada
          </div>
          <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Con Home Assistant: control total sin límites
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">
            Diseñamos e implantamos ecosistemas inteligentes a medida para viviendas, oficinas, hoteles y restaurantes.
            Nuestro enfoque es puramente técnico y funcional: que la tecnología sea invisible, útil y, sobre todo, que funcione siempre.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <a
              href="#domotica-form"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Quiero presupuesto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
