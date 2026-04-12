import { Resend } from 'resend';
import type { PresupuestoInput } from './schema';
import type { PresupuestoResult } from './calculate';

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export async function sendPresupuestoEmails(args: {
  input: PresupuestoInput;
  result: PresupuestoResult;
  pdfBuffer: Buffer;
  quoteId: string;
}) {
  const { input, result, pdfBuffer, quoteId } = args;

  const resendKey = requiredEnv('RESEND_API_KEY');
  const fromEmail = requiredEnv('FROM_EMAIL');
  const adminEmail = requiredEnv('ADMIN_EMAIL');

  const resend = new Resend(resendKey);

  const attachment = {
    filename: `presupuesto-${quoteId}.pdf`,
    content: pdfBuffer.toString('base64')
  };

  const subject = `Presupuesto técnico (PDF) · Suelo radiante · Ref ${quoteId}`;

  const clientHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 8px 0">Presupuesto técnico en PDF</h2>
      <p style="margin:0 0 14px 0">Hola ${escapeHtml(input.contacto.nombre)},</p>
      <p style="margin:0 0 14px 0">
        Adjuntamos tu presupuesto técnico para la limpieza/desfangado de suelo radiante.
        <br/>Referencia: <strong>${quoteId}</strong>
      </p>
      <p style="margin:0 0 6px 0"><strong>Total estimado:</strong> ${result.totalEur} € (IVA incl.)</p>
      <p style="margin:0 0 14px 0; color:#475569; font-size:13px">
        Esta estimación se confirma tras verificación de accesos y estado real de la instalación.
      </p>
      <p style="margin:0">— TSV Servicios</p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 8px 0">Nuevo presupuesto generado</h2>
      <p style="margin:0 0 10px 0"><strong>Ref:</strong> ${quoteId}</p>
      <p style="margin:0 0 4px 0"><strong>Cliente:</strong> ${escapeHtml(input.contacto.nombre)} (${escapeHtml(
        input.contacto.email
      )})</p>
      <p style="margin:0 0 4px 0"><strong>Provincia:</strong> ${escapeHtml(input.provincia)}</p>
      <p style="margin:0 0 4px 0"><strong>m²:</strong> ${input.m2} · <strong>Última limpieza:</strong> ${
        input.ultimaLimpieza
      } · <strong>Antigüedad instalación:</strong> ${
        input.antiguedadInstalacion
      }</p>
      <p style="margin:0 0 4px 0"><strong>Depósito de inercia:</strong> ${
        input.depositoInercia === 'si'
          ? `${input.depositoLitros ?? '—'} L`
          : input.depositoInercia === 'no'
            ? 'No'
            : '—'
      }</p>
      <p style="margin:10px 0 0 0"><strong>Total estimado:</strong> ${result.totalEur} € (IVA incl.)</p>
    </div>
  `;

  await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: input.contacto.email,
      subject,
      html: clientHtml,
      attachments: [attachment]
    }),
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `ADMIN · ${subject}`,
      html: adminHtml,
      attachments: [attachment],
      replyTo: input.contacto.email
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

