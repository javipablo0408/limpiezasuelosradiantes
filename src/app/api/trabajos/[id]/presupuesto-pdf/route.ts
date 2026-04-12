import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type Body = {
  numeroTrabajo: string;
  clienteNombre: string;
  clienteNif?: string | null;
  clienteDireccion?: string | null;
  inmuebleDireccion?: string | null;
  fecha?: string | null;
  subtotal?: number | null;
  iva?: number | null;
  total?: number | null;
  notas?: string | null;
  tipoServicio?: string | null;
  estadoTrabajo?: string | null;
  esUrgente?: boolean | null;
  m2?: number | null;
  m2eq?: number | null;
  tipoGenerador?: string | null;
  numColectores?: number | null;
  antiguedad?: string | null;
  ultimaLimpieza?: string | null;
  lineas?: Array<{
    descripcion: string;
    precio: number;
  }>;
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Body;
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const color = rgb(0.06, 0.1, 0.16);

    let y = 800;
    const draw = (text: string, size = 11, isBold = false, x = 50) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color
      });
      y -= size + 8;
    };

    const euro = (v?: number | null) => `${(v ?? 0).toFixed(2)} EUR`;

    draw('Presupuesto de limpieza de suelo radiante', 18, true);
    y -= 4;
    draw(`Trabajo: ${body.numeroTrabajo}`);
    draw(`Fecha: ${body.fecha ?? '-'}`);
    draw(`Estado: ${body.estadoTrabajo ?? '-'}`);
    y -= 8;
    draw(`Cliente: ${body.clienteNombre}`, 12, true);
    draw(`NIF: ${body.clienteNif ?? '-'}`);
    draw(`Direccion fiscal: ${body.clienteDireccion ?? '-'}`);
    draw(`Inmueble: ${body.inmuebleDireccion ?? '-'}`);
    y -= 8;
    draw('Detalle del servicio', 12, true);
    draw(`Tipo de servicio: ${body.tipoServicio ?? '-'}`);
    draw(`Urgente: ${body.esUrgente ? 'Si' : 'No'}`);
    draw(`m2 instalacion: ${body.m2 ?? 0}`);
    draw(`m2 equivalentes: ${body.m2eq ?? 0}`);
    draw(`Tipo generador: ${body.tipoGenerador ?? '-'}`);
    draw(`Colectores: ${body.numColectores ?? '-'}`);
    draw(`Antiguedad: ${body.antiguedad ?? '-'}`);
    draw(`Ultima limpieza: ${body.ultimaLimpieza ?? '-'}`);

    y -= 8;
    draw('Desglose economico', 12, true);
    draw('Concepto', 10, true, 50);
    draw('Importe', 10, true, 450);
    y += 18;
    y -= 12;
    const lineas = body.lineas ?? [];
    for (const linea of lineas) {
      draw(`- ${linea.descripcion}`, 10, false, 50);
      y += 18;
      draw(euro(linea.precio), 10, false, 450);
      y -= 10;
    }
    y -= 8;
    draw(`Subtotal: ${euro(body.subtotal)}`);
    draw(`IVA (21%): ${euro(body.iva)}`);
    draw(`Total: ${euro(body.total)}`, 13, true);

    if (body.notas) {
      y -= 10;
      draw('Notas:', 12, true);
      draw(body.notas, 10, false);
    }

    const bytes = await pdf.save();
    const buffer = Buffer.from(bytes);
    const fileName = `presupuesto-${id}-${Date.now()}.pdf`;
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, fileName), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${fileName}` });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error generando PDF' },
      { status: 500 }
    );
  }
}
