import { renderToBuffer } from '@react-pdf/renderer';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PresupuestoInput } from './schema';
import type { PresupuestoResult } from './calculate';
import { PresupuestoPdf } from './pdf';

export async function renderPresupuestoPdfBuffer(args: {
  input: PresupuestoInput;
  result: PresupuestoResult;
  quoteId: string;
  photos?: Array<{ dataUri: string; fileName: string }>;
}) {
  const { input, result, quoteId, photos } = args;
  const logoPath = join(process.cwd(), 'public', 'logo.png');
  let logoDataUri: string | undefined;
  try {
    const logoBuffer = readFileSync(logoPath);
    logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    logoDataUri = undefined;
  }

  const doc = PresupuestoPdf({ input, result, quoteId, logoDataUri, photos });
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}

