'use client';

import { useCallback, useState } from 'react';

const INTERESES = [
  'Integración domótica avanzada',
  'Climatización inteligente',
  'Iluminación y escenas',
  'Energía y consumo',
  'Sistema Loxone',
  'Dispositivos Matter',
  'Integración KNX',
  'Integraciones API/HTTP',
  'Otro (especificar en el mensaje)'
] as const;

export function DomoticaConsultaForm() {
  const [preferNoPresupuesto, setPreferNoPresupuesto] = useState(false);
  const [interesesError, setInteresesError] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'hidden' | 'info' | 'ok' | 'err'; text: string }>({
    kind: 'hidden',
    text: ''
  });

  const togglePresupuesto = useCallback(
    (form: HTMLFormElement, checked: boolean) => {
      const input = form.querySelector<HTMLInputElement>('input[name="presupuestoAprox"]');
      if (!input) return;
      input.disabled = checked;
      if (checked) input.value = '';
    },
    []
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setInteresesError('');
    const intereses = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="intereses"]:checked'));
    if (intereses.length === 0) {
      setInteresesError('Selecciona al menos un interés.');
      return;
    }

    setFeedback({ kind: 'info', text: 'Enviando consulta...' });
    try {
      const fd = new FormData(form);
      const res = await fetch('/api/domotica-consulta', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => null)) as { applicationId?: string; error?: string } | null;
      if (!res.ok) {
        setFeedback({ kind: 'err', text: data?.error ?? 'No se pudo enviar la consulta.' });
        return;
      }
      setFeedback({
        kind: 'ok',
        text: `Consulta enviada. Referencia: ${data?.applicationId ?? '—'}.`
      });
      form.reset();
      setPreferNoPresupuesto(false);
      togglePresupuesto(form, false);
    } catch {
      setFeedback({ kind: 'err', text: 'No se pudo enviar la consulta. Inténtalo de nuevo.' });
    }
  }

  return (
    <section className="mx-auto max-w-none px-16 py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-1">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Tu cerebro domótico: Libertad y Potencia</h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">
              Somos especialistas en utilizar Home Assistant como el núcleo soberano que lo une todo. Esto nos permite integrar cualquier
              plataforma, protocolo o dispositivo del mercado en una sola interfaz coherente, privada y sin dependencia de la nube.
            </p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">
              Nuestra diferencia: No somos solo instaladores; somos informáticos. Donde otros encuentran un sistema cerrado o un dispositivo
              “incompatible”, nosotros desarrollamos la lógica o la integración necesaria para que todo hable entre sí.
            </p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">Domótica abierta, escalable y sin ataduras.</p>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Qué hacemos</h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-600">
              Creamos sistemas que no dependen de una sola marca. Integramos tecnologías heterogéneas en una experiencia de usuario única y fluida.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">Integración de Sistemas y Protocolos</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Unificamos lo que otros dejan separado bajo un mismo paraguas técnico:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Home Assistant como orquestador central y servidor local.</li>
                <li>Estándar Matter y Thread para la conectividad del futuro.</li>
                <li>Dispositivos Zigbee y Z-Wave para mallas inalámbricas robustas.</li>
                <li>Ecosistemas Shelly, dispositivos WiFi/IP y monitorización local.</li>
                <li>Integraciones personalizadas mediante APIs / HTTP / MQTT.</li>
                <li>Adiós a las mil apps: un solo panel de control para toda tu infraestructura.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">Climatización Inteligente (Nuestro punto fuerte)</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                La climatización es el mayor consumidor de energía y el principal factor de confort. Por eso, la tratamos como el corazón del sistema:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Control total de Aerotermia y sistemas de climatización industrial.</li>
                <li>Gestión de Suelo radiante / refrescante y Fan coils.</li>
                <li>Zonificación inteligente por estancias.</li>
                <li>Algoritmos de eficiencia: tu casa se adelanta a los cambios térmicos basándose en predicciones meteorológicas y ocupación.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">Iluminación y Escenas Automáticas</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">La luz debe ser funcional y desatendida:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Sensores de presencia de alta precisión (mmWave).</li>
                <li>Ritmos circadianos (la luz cambia de tono según la posición del sol).</li>
                <li>Automatización basada en luxes reales y luz natural.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">Gestión Energética y Fotovoltaica</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">Optimiza cada vatio generado:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Monitorización de consumos y producción solar en tiempo real.</li>
                <li>Gestión de excedentes: activamos automáticamente cargas (climatización, ACS, vehículo eléctrico) cuando tu instalación solar produce más de lo que consumes.</li>
                <li>Gráficos históricos y predicciones de ahorro real.</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">¿Por qué elegirnos?</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
              <li>Expertos en Home Assistant: Exprimimos el sistema más potente y flexible del mundo.</li>
              <li>Perfil Informático: Resolvemos retos de redes, servidores y código que un instalador convencional no alcanza.</li>
              <li>Especialistas en Clima: Integramos la máquina a nivel de protocolo, no solo con un relé.</li>
              <li>Soberanía Digital: Tus datos se quedan en tu casa. Sin cuotas, sin nubes, sin cierres de servicio.</li>
              <li>Soporte en Madrid: Asistencia técnica directa y profesional en toda la Comunidad.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Contacto</h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              ¿Estás pensando en automatizar tu vivienda, oficina o negocio?
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Cuéntanos tu idea y te explicaremos qué tiene sentido hacer y qué no, sin compromiso.
            </p>

            <div className="mt-4 text-sm font-semibold text-slate-900">Contacto directo y trato personal</div>

            <form id="domotica-form" className="mt-6 space-y-5" onSubmit={onSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-900">Nombre completo *</label>
                  <input
                    name="nombreCompleto"
                    required
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                    placeholder="Nombre"
                    autoComplete="name"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-900">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-900">Teléfono *</label>
                  <input
                    name="telefono"
                    required
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                    placeholder="689571381"
                    autoComplete="tel"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-900">Tipo de proyecto *</label>
                  <select
                    name="tipoProyecto"
                    required
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="vivienda">Vivienda</option>
                    <option value="oficina">Oficina</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">Ubicación del proyecto *</label>
                <input
                  name="ubicacionProyecto"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Ciudad, zona..."
                  autoComplete="address-level2"
                />
              </div>

              <div className="grid gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">¿Qué te interesa? (Puedes seleccionar varios) *</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTERESES.map((t) => (
                    <label
                      key={t}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <input type="checkbox" name="intereses" value={t} className="mt-1" />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
                {interesesError ? <div className="text-sm text-red-600">{interesesError}</div> : null}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">Cuéntanos tu proyecto o necesidades *</label>
                <textarea
                  name="mensaje"
                  required
                  rows={5}
                  className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                  placeholder="Describe qué necesitas, qué quieres automatizar, qué problemas quieres resolver..."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr] sm:items-end">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-900">Presupuesto aproximado</label>
                  <input
                    name="presupuestoAprox"
                    disabled={preferNoPresupuesto}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)] disabled:opacity-50"
                    placeholder="Prefiero no indicarlo o indícame un rango"
                    inputMode="text"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="presupuestoNoIndicar"
                    value="true"
                    checked={preferNoPresupuesto}
                    onChange={(ev) => {
                      const checked = ev.target.checked;
                      setPreferNoPresupuesto(checked);
                      const f = ev.currentTarget.form;
                      if (f) togglePresupuesto(f, checked);
                    }}
                    className="h-4 w-4 accent-[var(--color-brand-blue-700)]"
                  />
                  <span>Prefiero no indicarlo</span>
                </label>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-900">¿Cuándo te gustaría empezar?</label>
                <select
                  name="inicioPrevisto"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue-600)]"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="inmediato">Inmediato</option>
                  <option value="1-3">1-3 meses</option>
                  <option value="3-6">3-6 meses</option>
                  <option value="6+">6+ meses</option>
                </select>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="aceptoPrivacidad"
                  value="true"
                  required
                  className="mt-1 h-4 w-4 accent-[var(--color-brand-blue-700)]"
                />
                <span className="text-sm leading-relaxed text-slate-700">Acepto la política de privacidad *</span>
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Responderemos con enfoque técnico: compatibilidad, arquitectura y pasos concretos.
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-orange-600)] px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-[var(--color-brand-orange-500)]"
                >
                  Enviar consulta
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
        </div>
      </div>
    </section>
  );
}
