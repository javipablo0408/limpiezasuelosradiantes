import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { presupuestoInputSchema } from '../../server/presupuesto/schema';
import { calculatePresupuesto } from '../../server/presupuesto/calculate';
import { renderPresupuestoPdfBuffer } from '../../server/presupuesto/renderPdf';
import { sendPresupuestoEmails } from '../../server/presupuesto/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';

  let parsedInput: unknown;
  let photos: Array<{ dataUri: string; fileName: string }> = [];

  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();

    const getStr = (k: string) => form.get(k);
    const getEnum = (k: string) => (typeof getStr(k) === 'string' ? (getStr(k) as string) : '');
    const getNum = (k: string) => {
      const v = getStr(k);
      if (typeof v !== 'string') return NaN;
      return Number(v);
    };

    const contacto = {
      nombre: getEnum('contacto_nombre'),
      email: getEnum('contacto_email'),
      telefono: getEnum('contacto_telefono') || undefined
    };

    parsedInput = {
      m2: getNum('m2'),
      ultimaLimpieza: getEnum('ultimaLimpieza'),
      antiguedadInstalacion: getEnum('antiguedadInstalacion'),
      colectores: getNum('colectores'),
      provincia: getEnum('provincia'),
      depositoInercia: getEnum('depositoInercia') || undefined,
      depositoLitros: getStr('depositoLitros') ? getNum('depositoLitros') : undefined,
      contacto
    };

    const fileEntries = form.getAll('fotos').filter((v) => v && typeof (v as any).arrayBuffer === 'function') as any[];
    if (fileEntries.length > 0) {
      const maxPhotos = 4;
      const selected = fileEntries.slice(0, maxPhotos);
      const converted: Array<{ dataUri: string; fileName: string }> = [];
      for (const file of selected) {
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mime = (file as File).type || 'image/jpeg';
        converted.push({
          dataUri: `data:${mime};base64,${buffer.toString('base64')}`,
          fileName: (file as File).name ?? 'foto'
        });
      }
      photos = converted;
    }
  } else {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return new Response('Body inválido', { status: 400 });
    }

    parsedInput = json;
  }

  const parsed = presupuestoInputSchema.safeParse(parsedInput);
  if (!parsed.success) {
    return new Response('Datos inválidos', { status: 400 });
  }

  const input = parsed.data;
  const result = calculatePresupuesto(input);
  const quoteId = `LSR-${randomUUID().slice(0, 8).toUpperCase()}`;

  const pdfBuffer = await renderPresupuestoPdfBuffer({ input, result, quoteId, photos });

  try {
    await sendPresupuestoEmails({ input, result, pdfBuffer, quoteId });
  } catch (err) {
    console.error('[presupuesto] email_error', err);
  }

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="presupuesto-${quoteId}.pdf"`,
      'cache-control': 'no-store'
    }
  });
};

