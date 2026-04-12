import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { calculatePresupuesto } from '@/server/presupuesto/calculate';
import { sendPresupuestoEmails } from '@/server/presupuesto/email';
import { renderPresupuestoPdfBuffer } from '@/server/presupuesto/renderPdf';
import { presupuestoInputSchema } from '@/server/presupuesto/schema';
import type { PresupuestoInput } from '@/server/presupuesto/schema';

export const runtime = 'nodejs';

/** Cuerpo JSON del wizard antiguo (3 pasos) → esquema completo del PDF. */
function normalizeWizardBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const b = body as Record<string, unknown>;
  if ('antiguedad' in b && !('antiguedadInstalacion' in b) && typeof b.antiguedad === 'string') {
    return {
      m2: b.m2,
      ultimaLimpieza: '3-5',
      antiguedadInstalacion: b.antiguedad,
      colectores: b.colectores,
      provincia: b.provincia,
      depositoInercia: 'no',
      contacto: b.contacto
    };
  }
  return body;
}

async function fileToPhoto(file: File): Promise<{ dataUri: string; fileName: string } | null> {
  const mime = file.type || 'image/jpeg';
  if (!mime.startsWith('image/')) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    dataUri: `data:${mime};base64,${buf.toString('base64')}`,
    fileName: file.name || 'foto.jpg'
  };
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let input: PresupuestoInput;
    const photos: Array<{ dataUri: string; fileName: string }> = [];

    if (contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      const get = (key: string) => {
        const v = fd.get(key);
        return v == null ? undefined : String(v);
      };
      const raw = {
        m2: Number(get('m2')),
        ultimaLimpieza: get('ultimaLimpieza'),
        antiguedadInstalacion: get('antiguedadInstalacion'),
        colectores: Number(get('colectores')),
        provincia: get('provincia')?.trim(),
        depositoInercia: get('depositoInercia') as 'si' | 'no' | undefined,
        depositoLitros: get('depositoLitros') ? Number(get('depositoLitros')) : undefined,
        contacto: {
          nombre: get('contacto_nombre')?.trim(),
          email: get('contacto_email')?.trim(),
          telefono: get('contacto_telefono')?.trim() || undefined
        }
      };
      input = presupuestoInputSchema.parse(raw);

      for (const entry of fd.getAll('fotos')) {
        if (entry instanceof File && entry.size > 0) {
          const p = await fileToPhoto(entry);
          if (p) photos.push(p);
        }
      }
    } else if (contentType.includes('application/json')) {
      const body = normalizeWizardBody(await req.json());
      input = presupuestoInputSchema.parse(body);
    } else {
      return NextResponse.json({ error: 'Usa multipart/form-data o application/json' }, { status: 415 });
    }

    const result = calculatePresupuesto(input);
    const quoteId = randomUUID().replace(/-/g, '').slice(0, 12);
    const pdfBuffer = await renderPresupuestoPdfBuffer({
      input,
      result,
      quoteId,
      photos: photos.length > 0 ? photos : undefined
    });

    try {
      await sendPresupuestoEmails({ input, result, pdfBuffer, quoteId });
    } catch (err) {
      console.error('[api/presupuesto] Envío por email no disponible:', err);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="presupuesto-${quoteId}.pdf"`
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al generar el presupuesto';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
