import React, { useEffect, useMemo, useRef, useState } from 'react';

type Urgencia = 'estandar' | 'urgente' | 'emergencia';

type State = {
  ubicacion: string;
  cp: string;
  m2: string;
  ultimaLimpieza: '0-2' | '3-5' | '6' | '7+' | 'nunca' | '';
  antiguedadInstalacion: '0-2' | '3-7' | '8-12' | '13+' | '';
  colectores: string;
  depositoInercia: 'si' | 'no' | '';
  depositoLitros: string;
  urgencia: Urgencia;
  nombre: string;
  email: string;
  telefono: string;
};

type Ui =
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

export default function PresupuestoForm() {
  const [ui, setUi] = useState<Ui>({ kind: 'idle' });
  const [s, setS] = useState<State>({
    ubicacion: 'Comunidad de Madrid',
    cp: '',
    m2: '',
    ultimaLimpieza: '0-2',
    antiguedadInstalacion: '0-2',
    colectores: '2',
    depositoInercia: '',
    depositoLitros: '',
    urgencia: 'estandar',
    nombre: '',
    email: '',
    telefono: ''
  });

  const [fotos, setFotos] = useState<File[]>([]);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Liberamos las URLs de previsualización anteriores
    return () => {
      for (const url of fotoPreviews) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFotoFiles(fileList: FileList | null) {
    if (!fileList) return;
    setFotoError(null);

    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) {
      setFotoError('Selecciona imágenes (PNG/JPG) para adjuntar.');
      return;
    }

    const maxFotos = 10;
    const maxMB = 10;
    const maxBytes = maxMB * 1024 * 1024;

    const trimmed = incoming.slice(0, Math.max(0, maxFotos));
    const tooBig = trimmed.find((f) => f.size > maxBytes);
    if (tooBig) {
      setFotoError(`Una de las fotos supera los ${maxMB}MB. Revisa el tamaño y vuelve a intentar.`);
      return;
    }

    // Revocamos previas anteriores
    for (const url of fotoPreviews) URL.revokeObjectURL(url);
    const nextPreviews = trimmed.map((f) => URL.createObjectURL(f));
    setFotos(trimmed);
    setFotoPreviews(nextPreviews);
  }

  const depositoLitrosNum = useMemo(() => {
    if (s.depositoLitros.trim() === '') return undefined;
    const n = Number.parseFloat(s.depositoLitros);
    if (Number.isNaN(n)) return undefined;
    return n;
  }, [s.depositoLitros]);

  const valid = useMemo(() => {
    return (
      s.ubicacion.trim().length >= 2 &&
      s.m2 !== '' &&
      Number(s.m2) >= 30 &&
      s.ultimaLimpieza !== '' &&
      s.antiguedadInstalacion !== '' &&
      s.depositoInercia !== '' &&
      (s.depositoInercia === 'si' ? depositoLitrosNum !== undefined && depositoLitrosNum >= 50 && depositoLitrosNum <= 10000 : true) &&
      s.nombre.trim().length >= 2 &&
      isEmail(s.email)
    );
  }, [s, depositoLitrosNum]);

  async function submit() {
    setUi({ kind: 'submitting' });
    try {
      const form = new FormData();
      form.append('m2', String(Number(s.m2)));
      form.append('ultimaLimpieza', s.ultimaLimpieza);
      form.append('antiguedadInstalacion', s.antiguedadInstalacion);
      form.append('colectores', String(Number(s.colectores || '1')));
      form.append('provincia', s.ubicacion.trim());
      form.append('depositoInercia', s.depositoInercia);
      if (s.depositoInercia === 'si' && depositoLitrosNum !== undefined) {
        form.append('depositoLitros', String(depositoLitrosNum));
      }
      form.append('contacto_nombre', s.nombre.trim());
      form.append('contacto_email', s.email.trim());
      if (s.telefono.trim()) form.append('contacto_telefono', s.telefono.trim());

      for (const f of fotos) {
        form.append('fotos', f);
      }

      const res = await fetch('/api/presupuesto', {
        method: 'POST',
        body: form
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[var(--color-brand-blue-700)] text-xs font-bold text-white">
              01
            </span>
            <div className="text-sm font-semibold text-slate-900">Detalles del Sistema</div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">UBICACIÓN</label>
              <input
                value={s.ubicacion}
                onChange={(e) => setS((p) => ({ ...p, ubicacion: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">CÓDIGO POSTAL</label>
              <input
                value={s.cp}
                onChange={(e) => setS((p) => ({ ...p, cp: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="28XXX"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">METROS CUADRADOS (APROX.)</label>
              <input
                inputMode="numeric"
                value={s.m2}
                onChange={(e) => setS((p) => ({ ...p, m2: clampInt(e.target.value, 0, 100000) }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                placeholder="Ej: 120"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">AÑOS DESDE LA ÚLTIMA LIMPIEZA</label>
              <select
                value={s.ultimaLimpieza}
                onChange={(e) => setS((p) => ({ ...p, ultimaLimpieza: e.target.value as State['ultimaLimpieza'] }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              >
                <option value="">Selecciona…</option>
                <option value="0-2">Menos de 2 años</option>
                <option value="3-5">3–5 años</option>
                <option value="6">6 años</option>
                <option value="7+">7 o más años</option>
                <option value="nunca">Nunca se ha realizado</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-slate-600">ANTIGÜEDAD DE LA INSTALACIÓN</label>
              <select
                value={s.antiguedadInstalacion}
                onChange={(e) =>
                  setS((p) => ({ ...p, antiguedadInstalacion: e.target.value as State['antiguedadInstalacion'] }))
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              >
                <option value="">Selecciona…</option>
                <option value="0-2">0–2 años</option>
                <option value="3-7">3–7 años</option>
                <option value="8-12">8–12 años</option>
                <option value="13+">Más de 13 años</option>
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-2 md:w-64">
              <label className="text-xs font-semibold text-slate-600">Nº COLECTORES</label>
              <input
                inputMode="numeric"
                value={s.colectores}
                onChange={(e) => setS((p) => ({ ...p, colectores: clampInt(e.target.value, 1, 10) }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
              />
            </div>

            <div className="flex flex-1 items-center justify-between rounded-xl bg-white px-4 py-3 text-sm">
              <div className="font-semibold text-slate-900">Depósito de Inercia</div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="deposito"
                    checked={s.depositoInercia === 'si'}
                    onChange={() => setS((p) => ({ ...p, depositoInercia: 'si' }))}
                  />
                  Sí
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="deposito"
                    checked={s.depositoInercia === 'no'}
                    onChange={() => setS((p) => ({ ...p, depositoInercia: 'no' }))}
                  />
                  No
                </label>
              </div>
            </div>

            {s.depositoInercia === 'si' ? (
              <div className="grid gap-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Cantidad de litros del depósito *</label>
                <input
                  inputMode="numeric"
                  value={s.depositoLitros}
                  onChange={(e) => setS((p) => ({ ...p, depositoLitros: clampInt(e.target.value, 0, 100000) }))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Ej: 500"
                />
                <p className="text-xs text-slate-500">Rango típico: 50–10.000 litros.</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[var(--color-brand-blue-700)] text-xs font-bold text-white">
              02
            </span>
            <div className="text-sm font-semibold text-slate-900">Fotos de la Instalación</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            (Opcional) Arrastra fotos del colector/sala de calderas para afinar el presupuesto.
          </p>
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFotoFiles(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => handleFotoFiles(e.target.files)}
            />

            <div
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleFotoFiles(e.dataTransfer.files);
              }}
            >
              <div className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600" aria-hidden="true">
                IMG
              </div>

              <div className="mt-3 text-sm font-semibold text-slate-900">
                {fotoPreviews.length > 0 ? `Fotos seleccionadas: ${fotoPreviews.length}` : 'Arrastra y suelta las fotos aquí'}
              </div>

              <div className="mt-1 text-xs text-slate-500">PNG, JPG (máx. 10MB) · Hasta 10 fotos</div>

              {fotoError ? <div className="mt-3 text-sm text-red-700">{fotoError}</div> : null}

              {fotoPreviews.length > 0 ? (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {fotoPreviews.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${idx + 1}`} className="h-20 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Explorar Archivos
              </button>

              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[var(--color-brand-blue-700)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-blue-600)]"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
              >
                Tomar Foto
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-100 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[var(--color-brand-blue-700)] text-xs font-bold text-white">
              03
            </span>
            <div className="text-sm font-semibold text-slate-900">Urgencia del Servicio</div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { id: 'estandar', title: 'Estándar', desc: 'Mantenimiento normal' },
              { id: 'urgente', title: 'Urgente', desc: 'Servicio en 72 horas (10%)' },
              { id: 'emergencia', title: 'Emergencia', desc: 'Intervención inmediata' }
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setS((p) => ({ ...p, urgencia: o.id as Urgencia }))}
                className={[
                  'rounded-2xl border bg-white p-4 text-left shadow-sm transition',
                  s.urgencia === o.id
                    ? 'border-[var(--color-brand-blue-700)] ring-2 ring-[var(--color-brand-blue-100)]'
                    : 'border-slate-200 hover:border-slate-300'
                ].join(' ')}
              >
                <div className="text-sm font-semibold text-slate-900">{o.title}</div>
                <div className="mt-1 text-xs text-slate-500">{o.desc}</div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-[var(--color-brand-blue-900)] p-5 text-white shadow-sm">
          <div className="text-sm font-semibold">Información de Contacto</div>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-1">
              <label className="text-[11px] font-semibold text-white/70">NOMBRE COMPLETO</label>
              <input
                value={s.nombre}
                onChange={(e) => setS((p) => ({ ...p, nombre: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                placeholder="Javier Pérez"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-[11px] font-semibold text-white/70">CORREO ELECTRÓNICO</label>
              <input
                value={s.email}
                onChange={(e) => setS((p) => ({ ...p, email: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                placeholder="tu@correo.com"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-[11px] font-semibold text-white/70">NÚMERO DE TELÉFONO</label>
              <input
                value={s.telefono}
                onChange={(e) => setS((p) => ({ ...p, telefono: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/30"
                placeholder="+34 689 57 13 81"
              />
            </div>

            <div className="mt-1 text-[11px] font-semibold text-white/70">
              Correo de empresa:
              <span className="text-white/95"> consultas@limpiezasuelosradiantes.com</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Resumen de la Solicitud</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Los datos se usan para generar el PDF.</li>
            <li>• Recibirás el presupuesto por email.</li>
            <li>• El PDF se descarga al instante tras enviar.</li>
          </ul>

          {ui.kind === 'error' ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{ui.message}</div>
          ) : null}
          {ui.kind === 'success' ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Presupuesto generado. Revisa tu email.
            </div>
          ) : null}

          <button
            type="button"
            disabled={!valid || ui.kind === 'submitting'}
            onClick={submit}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-brand-orange-600)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-brand-orange-500)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ui.kind === 'submitting' ? 'Generando…' : 'Solicitar mi Presupuesto'}
          </button>

          <div className="mt-3 text-center text-xs text-slate-500">
            ¿Necesitas ayuda? <span className="font-semibold text-slate-700">Llamar al soporte técnico</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

