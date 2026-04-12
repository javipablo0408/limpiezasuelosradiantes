const items = [
  { q: '¿Cada cuánto tiempo debería limpiarse?', a: 'Se recomienda llevar a cabo la limpieza del sistema de suelo radiante cada 2 a 3 años.' },
  { q: '¿Qué incluye el servicio de limpieza profesional?', a: 'Incluye inspección, comprobación del agua, limpieza de circuitos y aplicación de líquidos protectores.' },
  { q: '¿Cómo saber si mi suelo radiante necesita limpieza?', a: 'Pérdida de eficiencia térmica, aumento del consumo, ruidos o desigualdad en calefacción.' },
  { q: '¿Por qué es importante el purgado del sistema?', a: 'Elimina aire acumulado, mejora la distribución de calor y evita puntos fríos.' }
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Preguntas frecuentes</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <details key={i.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-900">
                <span>{i.q}</span>
                <span className="float-right text-slate-400 group-open:text-slate-700" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
