import { Resend } from 'resend';
import type { DomoticaConsultaInput } from './schema';

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export async function sendDomoticaEmails(args: {
  input: DomoticaConsultaInput;
  applicationId: string;
}) {
  const { input, applicationId } = args;

  const resendKey = requiredEnv('RESEND_API_KEY');
  const fromEmail = requiredEnv('FROM_EMAIL');
  const adminEmail = requiredEnv('ADMIN_EMAIL');

  const resend = new Resend(resendKey);

  const interests = input.intereses.join(', ');
  const preferNo = Boolean(input.presupuestoNoIndicar);
  const presupuesto = preferNo ? 'Prefiero no indicarlo' : input.presupuestoAprox?.trim() || '—';

  const subject = `Consulta domótica · Ref ${applicationId}`;

  const adminHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 10px 0">Nueva consulta de Domótica</h2>
      <p style="margin:0 0 8px 0"><strong>Referencia:</strong> ${applicationId}</p>
      <p style="margin:0 0 8px 0"><strong>Nombre:</strong> ${escapeHtml(input.nombreCompleto)}</p>
      <p style="margin:0 0 8px 0"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px 0"><strong>Teléfono:</strong> ${escapeHtml(input.telefono)}</p>
      <p style="margin:0 0 8px 0"><strong>Tipo de proyecto:</strong> ${escapeHtml(input.tipoProyecto)}</p>
      <p style="margin:0 0 8px 0"><strong>Ubicación del proyecto:</strong> ${escapeHtml(input.ubicacionProyecto)}</p>
      <p style="margin:0 0 8px 0"><strong>Intereses:</strong> ${escapeHtml(interests)}</p>
      <p style="margin:0 0 8px 0"><strong>Presupuesto:</strong> ${escapeHtml(presupuesto)}</p>
      <p style="margin:0 0 8px 0"><strong>Inicio previsto:</strong> ${escapeHtml(input.inicioPrevisto ?? '—')}</p>
      <p style="margin:10px 0 0 0"><strong>Mensaje:</strong></p>
      <div style="margin-top:6px; padding:12px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; white-space:pre-wrap">${escapeHtml(
        input.mensaje
      )}</div>
    </div>
  `;

  const clientHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 10px 0">Gracias por tu consulta de Domótica</h2>
      <p style="margin:0 0 10px 0">Hola ${escapeHtml(input.nombreCompleto)},</p>
      <p style="margin:0 0 10px 0">
        Hemos recibido tu solicitud. Referencia: <strong>${applicationId}</strong>.
        Te contactaremos con enfoque técnico para indicarte qué tiene sentido hacer y qué no.
      </p>
      <p style="margin:0">— T&V Servicios</p>
    </div>
  `;

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `ADMIN · ${subject}`,
      html: adminHtml,
      replyTo: input.email
    }),
    resend.emails.send({
      from: fromEmail,
      to: input.email,
      subject,
      html: clientHtml
    })
  ]);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

