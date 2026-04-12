import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { sendInstaladorEmails } from '@/server/instaladores/email';
import { instaladorInputSchema } from '@/server/instaladores/schema';

export const runtime = 'nodejs';

function formToObject(form: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    out[k] = typeof v === 'string' ? v : '';
  }
  return out;
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  let body: unknown;
  try {
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = formToObject(form);
    }
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  if (body && typeof body === 'object' && 'emailEmpresa' in body) {
    const o = body as Record<string, unknown>;
    const e = o.emailEmpresa;
    if (e === '' || e === undefined) delete o.emailEmpresa;
  }

  const parsed = instaladorInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const applicationId = `INST-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await sendInstaladorEmails({ input: parsed.data, applicationId });
  } catch (err) {
    console.error('[instaladores] email_error', err);
    return NextResponse.json({ error: 'No se pudo enviar la solicitud' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, applicationId },
    { status: 200, headers: { 'cache-control': 'no-store' } }
  );
}
