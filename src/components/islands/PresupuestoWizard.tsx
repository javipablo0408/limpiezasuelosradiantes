import React, { useMemo, useState } from 'react';

type Step = 1 | 2 | 3;

type FormState = {
  email: string;
  nombre: string;
  telefono: string;
  m2: string;
  antiguedad: '0-2' | '3-7' | '8-12' | '13+' | '';
  colectores: string;
  provincia: string;
};

type UiState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

function clampInt(value: string, min: number, max: number) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return '';
  return String(Math.max(min, Math.min(max, n)));
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PresupuestoWizard() {
  const [step, setStep] = useState<Step>(1);
  const [ui, setUi] = useState<UiState>({ kind: 'idle' });
  const [form, setForm] = useState<FormState>({
    email: '',
    nombre: '',
    telefono: '',
    m2: '',
    antiguedad: '',
    colectores: '',
    provincia: 'Madrid'
  });

  const step1Valid = useMemo(() => {
    return (
      form.m2 !== '' &&
      Number(form.m2) >= 30 &&
      form.antiguedad !== '' &&
      form.colectores !== '' &&
      Number(form.colectores) >= 1
    );
  }, [form]);

  const step2Valid = useMemo(() => {
    return form.provincia.trim().length >= 2;
  }, [form.provincia]);

  const step3Valid = useMemo(() => {
    return isEmail(form.email) && form.nombre.trim().length >= 2;
  }, [form.email, form.nombre]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUi({ kind: 'submitting' });

    try {
      const payload = {
        m2: Number(form.m2),
        antiguedad: form.antiguedad,
        colectores: Number(form.colectores),
        provincia: form.provincia.trim(),
        contacto: {
          email: form.email.trim(),
          nombre: form.nombre.trim(),
          telefono: form.telefono.trim() || undefined
        }
      };

      const res = await fetch('/api/presupuesto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'No se pudo generar el presupuesto.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presupuesto-limpieza-suelo-radiante.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setUi({ kind: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado.';
      setUi({ kind: 'error', message });
    }
  }

  const canContinue =
    (step === 1 && step1Valid) || (step === 2 && step2Valid) || (step === 3 && step3Valid && ui.kind !== 'submitting');

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Presupuesto técnico</div>
          <div className="mt-1 text-xs text-slate-600">Paso {step} de 3 · PDF automático + envío por email</div>
        </div>
        <div className="flex gap-1" aria-label="progreso">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={[
                'h-2 w-10 rounded-full',
                n <= step ? 'bg-[var(--color-brand-blue-700)]' : 'bg-slate-200'
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      {ui.kind === 'error' ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{ui.message}</div>
      ) : null}
      {ui.kind === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          PDF generado y descargado. También lo hemos enviado a tu email.
        </div>
      ) : null}

      {step === 1 ? (
        <section className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Metros cuadrados aproximados</label>
            <input
              inputMode="numeric"
              value={form.m2}
              onChange={(e) => setForm((s) => ({ ...s, m2: clampInt(e.target.value, 30, 800) }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="Ej: 120"
            />
            <p className="text-xs text-slate-500">Rango habitual: 30–800 m²</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Antigüedad del sistema</label>
            <select
              value={form.antiguedad}
              onChange={(e) => setForm((s) => ({ ...s, antiguedad: e.target.value as FormState['antiguedad'] }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
            >
              <option value="">Selecciona…</option>
              <option value="0-2">Menos de 2 años</option>
              <option value="3-7">3–7 años</option>
              <option value="8-12">8–12 años</option>
              <option value="13+">Más de 13 años</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Número de colectores</label>
            <input
              inputMode="numeric"
              value={form.colectores}
              onChange={(e) => setForm((s) => ({ ...s, colectores: clampInt(e.target.value, 1, 10) }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="Ej: 2"
            />
            <p className="text-xs text-slate-500">Si no lo sabes, usa 1 (viviendas pequeñas) o 2 (medias/grandes).</p>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Provincia</label>
            <input
              value={form.provincia}
              onChange={(e) => setForm((s) => ({ ...s, provincia: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="Ej: Madrid"
            />
            <p className="text-xs text-slate-500">Se usa para estimar desplazamiento/logística.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Qué vas a recibir</div>
            <ul className="mt-2 space-y-2">
              <li>Desglose por m², colectores y antigüedad</li>
              <li>Alcance del servicio (mecánico + químico + equilibrado)</li>
              <li>Recomendaciones preventivas (inhibidor/filtro magnético)</li>
            </ul>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Nombre y apellidos</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="Ej: Javier Pérez"
              autoComplete="name"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-900">Teléfono (opcional)</label>
            <input
              value={form.telefono}
              onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              placeholder="+34 689 57 13 81"
              autoComplete="tel"
            />
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))}
            disabled={step === 1 || ui.kind === 'submitting'}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Atrás
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s === 3 ? 3 : ((s + 1) as Step)))}
              disabled={!canContinue}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-blue-700)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-brand-blue-600)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canContinue}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-orange-600)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-brand-orange-500)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ui.kind === 'submitting' ? 'Generando…' : 'Generar PDF'}
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Al generar el PDF aceptas el tratamiento de datos para enviarte el presupuesto.
        </div>
      </div>
    </form>
  );
}

