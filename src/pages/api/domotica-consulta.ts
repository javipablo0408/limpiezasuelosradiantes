import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { domoticaConsultaSchema } from '../../server/domotica/schema';
import { sendDomoticaEmails } from '../../server/domotica/email';

export const prerender = false;

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const current = obj[key];
    if (current === undefined) obj[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else obj[key] = [current, value];
  }
  // Normalize checkbox absent => boolean false/undefined handled by zod coerce boolean.
  return obj;
}

function getAllValues(formData: FormData, key: string) {
  // Some runtimes don't implement getAll; we normalize manually.
  const out: string[] = [];
  for (const [k, v] of formData.entries()) {
    if (k === key) out.push(String(v));
  }
  return out;
}

export const POST: APIRoute = async ({ request }) => {
  let input: unknown;
  try {
    const form = await request.formData();

    // Special-case intereses to ensure an array
    const intereses = getAllValues(form, 'intereses');

    const obj = formDataToObject(form);
    input = {
      ...obj,
      intereses
    };
  } catch {
    return new Response('Body inválido', { status: 400 });
  }

  const parsed = domoticaConsultaSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return new Response('Datos inválidos', { status: 400 });
  }

  const applicationId = `DOM-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await sendDomoticaEmails({ input: parsed.data, applicationId });
  } catch (err) {
    console.error('[domotica-consulta] email_error', err);
    return new Response('No se pudo enviar la consulta', { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, applicationId }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};

