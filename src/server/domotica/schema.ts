import { z } from 'zod';

const tipoProyectoEnum = z.enum(['vivienda', 'oficina', 'hotel', 'restaurante', 'otro']);

const interesEnum = z.enum([
  'Integración domótica avanzada',
  'Climatización inteligente',
  'Iluminación y escenas',
  'Energía y consumo',
  'Sistema Loxone',
  'Dispositivos Matter',
  'Integración KNX',
  'Integraciones API/HTTP',
  'Otro (especificar en el mensaje)'
]);

export const domoticaConsultaSchema = z
  .object({
    nombreCompleto: z.string().min(2).max(120),
    email: z.string().email(),
    telefono: z.string().min(6).max(30),
    tipoProyecto: tipoProyectoEnum,
    ubicacionProyecto: z.string().min(3).max(160),
    intereses: z.array(interesEnum).min(1),
    mensaje: z.string().min(10).max(5000),
    presupuestoNoIndicar: z.coerce.boolean().optional(),
    presupuestoAprox: z.string().max(80).optional(),
    inicioPrevisto: z.enum(['inmediato', '1-3', '3-6', '6+']).optional().or(z.string().length(0)),
    aceptoPrivacidad: z.coerce.boolean()
  })
  .superRefine((val, ctx) => {
    const preferNo = Boolean(val.presupuestoNoIndicar);
    if (!preferNo) {
      // If user didn't tick "prefiero no indicarlo", allow empty presupuestoAprox (optional),
      // but if provided it must be non-empty.
      if (val.presupuestoAprox !== undefined && val.presupuestoAprox.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El presupuesto no puede estar vacío.', path: ['presupuestoAprox'] });
      }
    }
    if (val.inicioPrevisto === undefined || val.inicioPrevisto === '') return;
  });

export type DomoticaConsultaInput = z.infer<typeof domoticaConsultaSchema>;

