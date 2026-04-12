import type { Metadata } from 'next';
import PresupuestoForm from '@/components/islands/PresupuestoForm';
import Footer from '@/components/site/Footer';
import Header from '@/components/site/Header';

export const metadata: Metadata = {
  title: 'Solicitar presupuesto | Limpieza suelo radiante',
  description: 'Completa el formulario para recibir un presupuesto técnico en PDF en menos de 24h.'
};

export default function SolicitarPresupuestoPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased">
      <Header />

      <main className="bg-white">
        <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
            <div className="max-w-xl">
              <div className="text-xs font-semibold tracking-wide text-slate-500">PRESUPUESTO TÉCNICO</div>
              <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                <span className="text-[var(--color-brand-orange-600)]">Precisión</span> Técnica
                <br />
                para su sistema.
              </h1>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">
                Complete el siguiente formulario para recibir un presupuesto detallado en base a sus necesidades de climatización o
                mantenimiento en un plazo de 24 horas.
              </p>
            </div>

            <div className="hidden rounded-3xl bg-slate-50 p-6 lg:block">
              <div className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-white shadow-sm" />
              <div className="mt-4 flex justify-end">
                <div className="grid size-12 place-items-center rounded-2xl bg-[var(--color-brand-blue-700)] text-white shadow-sm">
                  👤
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 pb-14">
            <PresupuestoForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
