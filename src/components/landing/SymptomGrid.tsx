const symptoms = [
  'Zonas frías o desiguales',
  'Facturas más altas',
  'Ruidos en colectores',
  'Tiempos de calentamiento largos',
  'Válvulas atascadas',
  'Mantenimiento insuficiente'
];

export default function SymptomGrid() {
  return (
    <section id="sintomas" className="scroll-mt-24 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Señales típicas de pérdida de rendimiento
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {symptoms.map((s, i) => (
            <article key={s} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{i + 1}. {s}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
