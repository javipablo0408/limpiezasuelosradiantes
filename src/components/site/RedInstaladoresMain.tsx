'use client';

import type React from 'react';
import { useState } from 'react';

export function RedInstaladoresMain() {
  const [feedback, setFeedback] = useState<{ kind: 'hidden' | 'info' | 'ok' | 'err'; text: string }>({
    kind: 'hidden',
    text: ''
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback({ kind: 'info', text: 'Enviando…' });
    try {
      const res = await fetch('/api/instaladores', { method: 'POST', body: new FormData(e.currentTarget) });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { applicationId?: string };
      setFeedback({ kind: 'ok', text: `Solicitud enviada. Referencia: ${data.applicationId ?? '—'}` });
      e.currentTarget.reset();
    } catch {
      setFeedback({ kind: 'err', text: 'No se pudo enviar la solicitud. Revisa los datos e inténtalo de nuevo.' });
    }
  }

  return (
<main className="bg-slate-50">
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Formulario para unirse a nuestra red de instaladores
          </h1>
          <p className="mt-4 text-pretty text-slate-600">
            <span className="font-semibold text-slate-900">¿Eres técnico especializado en limpiezas de suelo radiante?</span>
            <br />
            En <span className="font-semibold">T&V SERVICIOS</span> buscamos profesionales de confianza para unirse a nuestra red.
            <br />
            👉 Rellena el formulario y nos pondremos en contacto contigo.
          </p>
        </div>

        <form onSubmit={onSubmit}
          id="instaladores-form"
          method="post"
          action="/api/instaladores"
          className="mt-10 grid gap-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Dirección Email empresa</label>
              <input
                name="emailEmpresa"
                type="email"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="empresa@dominio.com"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Nombre *</label>
              <input
                name="nombre"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Apellidos</label>
              <input
                name="apellidos"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="Apellidos"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Nombre de empresa *</label>
              <input
                name="nombreEmpresa"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="Nombre de empresa"
                autoComplete="organization"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">CIF *</label>
              <input
                name="cif"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="CIF"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Dirección empresa</div>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Dirección (línea 1) *</label>
                <input
                  name="direccion1"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Dirección (línea 1)"
                  autoComplete="address-line1"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Dirección 2</label>
                <input
                  name="direccion2"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Dirección 2"
                  autoComplete="address-line2"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">Ciudad *</label>
                <input
                  name="ciudad"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Ciudad"
                  autoComplete="address-level2"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">State / Province / Region *</label>
                <input
                  name="region"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="State / Province / Region"
                  autoComplete="address-level1"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">Postal Code *</label>
                <input
                  name="codigoPostal"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Postal Code"
                  autoComplete="postal-code"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">País *</label>
                <select
                  name="pais"
                  required
                  defaultValue="Spain"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  autoComplete="country-name"
                >
                  <option value="">--- Select country ---</option>
                  <option value="Spain">Spain</option>
                  <option value="Portugal">Portugal</option>
                  <option value="France">France</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Teléfono *</label>
              <div className="flex gap-3">
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                  Spain +34
                </div>
                <input
                  name="telefono"
                  required
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="612 34 56 78"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-900">Email *</label>
              <input
                name="email"
                type="email"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="Email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Al enviar este formulario, aceptas el tratamiento de tus datos para gestionar tu solicitud.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--color-brand-orange-600)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-brand-orange-500)]"
            >
              Enviar solicitud
            </button>
          </div>

          {feedback.kind !== 'hidden' ? (
            <div
              className={[
                'rounded-2xl border p-4 text-sm',
                feedback.kind === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : feedback.kind === 'err'
                    ? 'border-red-200 bg-red-50 text-red-800'
                    : 'border-slate-200 bg-white text-slate-700'
              ].join(' ')}
            >
              {feedback.text}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  </main>
  );
}
