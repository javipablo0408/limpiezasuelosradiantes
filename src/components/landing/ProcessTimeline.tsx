const steps = [
  { n: '01', title: 'Diagnóstico y protección', desc: 'Revisión de colectores, caudales y estado del circuito.' },
  { n: '02', title: 'Limpieza mecánica', desc: 'Lavado por circuitos para desprender lodos, óxidos y sedimentos.' },
  { n: '03', title: 'Tratamiento químico', desc: 'Aplicación de limpiador compatible, neutralización y enjuague.' },
  { n: '04', title: 'Equilibrado e informe', desc: 'Ajuste de caudales y entrega de informe técnico en PDF.' }
];

export default function ProcessTimeline() {
  return (
    <section id="proceso" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Proceso de limpieza/desfangado</h2>
        <ol className="mt-10 grid gap-4 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="rounded-full bg-[var(--color-brand-blue-700)] px-3 py-1 text-xs font-semibold tracking-wide text-white inline-block">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
