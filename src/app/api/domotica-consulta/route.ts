import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { sendDomoticaEmails } from '@/server/domotica/email';
import { domoticaConsultaSchema } from '@/server/domotica/schema';

export const runtime = 'nodejs';

function formDataToObject(formData: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const current = obj[key];
    if (current === undefined) obj[key] = value;
    else if (Array.isArray(current)) (current as unknown[]).push(value);
    else obj[key] = [current, value];
  }
  return obj;
}

function getAllValues(formData: FormData, key: string) {
  const out: string[] = [];
  for (const [k, v] of formData.entries()) {
    if (k === key) out.push(String(v));
  }
  return out;
}

export async function POST(req: Request) {
  let input: unknown;
  try {
    const form = await req.formData();
    const intereses = getAllValues(form, 'intereses');
    const obj = formDataToObject(form);
    input = { ...obj, intereses };
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = domoticaConsultaSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }

  const applicationId = `DOM-${randomUUID().slice(0, 8).toUpperCase()}`;

  try {
    await sendDomoticaEmails({ input: parsed.data, applicationId });
  } catch (err) {
    console.error('[domotica-consulta] email_error', err);
    return NextResponse.json({ error: 'No se pudo enviar la consulta' }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, applicationId },
    { status: 200, headers: { 'cache-control': 'no-store' } }
  );
}
