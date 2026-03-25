import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { instaladorInputSchema } from '../../server/instaladores/schema';
import { sendInstaladorEmails } from '../../server/instaladores/email';

export const prerender = false;

function toPlainObject(form: FormData) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) out[k] = String(v);
  return out;
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') ?? '';

  let body: unknown;
  try {
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const form = await request.formData();
      body = toPlainObject(form);
    }
  } catch {
    return new Response('Body inválido', { status: 400 });
  }

  const parsed = instaladorInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Datos inválidos', { status: 400 });
  }

  const input = parsed.data;
  const applicationId = `INST-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await sendInstaladorEmails({ input, applicationId });
  } catch (err) {
    console.error('[instaladores] email_error', err);
    return new Response('No se pudo enviar la solicitud', { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, applicationId }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};

