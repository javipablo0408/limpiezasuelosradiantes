import { Resend } from 'resend';
import type { InstaladorInput } from './schema';

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

export async function sendInstaladorEmails(args: { input: InstaladorInput; applicationId: string }) {
  const { input, applicationId } = args;

  const resendKey = requiredEnv('RESEND_API_KEY');
  const fromEmail = requiredEnv('FROM_EMAIL');
  const adminEmail = requiredEnv('ADMIN_EMAIL');

  const resend = new Resend(resendKey);

  const subject = `Alta red instaladores · Ref ${applicationId}`;

  const adminHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 8px 0">Nueva solicitud: red de instaladores</h2>
      <p style="margin:0 0 10px 0"><strong>Ref:</strong> ${applicationId}</p>
      <p style="margin:0 0 4px 0"><strong>Nombre:</strong> ${escapeHtml(input.nombre)} ${escapeHtml(
    input.apellidos ?? ''
  )}</p>
      <p style="margin:0 0 4px 0"><strong>Empresa:</strong> ${escapeHtml(input.nombreEmpresa)} · <strong>CIF:</strong> ${escapeHtml(
    input.cif
  )}</p>
      <p style="margin:0 0 4px 0"><strong>Email contacto:</strong> ${escapeHtml(input.email)} · <strong>Teléfono:</strong> ${escapeHtml(
    input.telefono
  )}</p>
      <p style="margin:0 0 4px 0"><strong>Email empresa:</strong> ${escapeHtml(input.emailEmpresa ?? '—')}</p>
      <p style="margin:10px 0 4px 0"><strong>Dirección:</strong></p>
      <p style="margin:0 0 4px 0">
        ${escapeHtml(input.direccion1)}${input.direccion2 ? `, ${escapeHtml(input.direccion2)}` : ''}
      </p>
      <p style="margin:0 0 4px 0">${escapeHtml(input.codigoPostal)} · ${escapeHtml(input.ciudad)}</p>
      <p style="margin:0 0 0 0">${escapeHtml(input.region)} · ${escapeHtml(input.pais)}</p>
    </div>
  `;

  const clientHtml = `
    <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5; color: #0f172a">
      <h2 style="margin:0 0 8px 0">Solicitud recibida</h2>
      <p style="margin:0 0 14px 0">Hola ${escapeHtml(input.nombre)},</p>
      <p style="margin:0 0 14px 0">
        Hemos recibido tu solicitud para unirte a la red de instaladores de T&V Servicios.
        <br/>Referencia: <strong>${applicationId}</strong>
      </p>
      <p style="margin:0 0 14px 0; color:#475569; font-size:13px">
        Nos pondremos en contacto contigo lo antes posible.
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
      reply_to: input.email
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

