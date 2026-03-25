import { z } from 'zod';

export const presupuestoInputSchema = z.object({
  m2: z.number().int().min(30).max(800),
  ultimaLimpieza: z.enum(['0-2', '3-5', '6', '7+', 'nunca']),
  antiguedadInstalacion: z.enum(['0-2', '3-7', '8-12', '13+']),
  colectores: z.number().int().min(1).max(10),
  provincia: z.string().min(2).max(80),
  depositoInercia: z.enum(['si', 'no']).optional(),
  depositoLitros: z.number().min(50).max(10000).optional(),
  contacto: z.object({
    email: z.string().email(),
    nombre: z.string().min(2).max(120),
    telefono: z.string().min(6).max(30).optional()
  })
}).superRefine((val, ctx) => {
  if (val.depositoInercia === 'si' && val.depositoLitros === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indica la cantidad de litros del depósito de inercia.',
      path: ['depositoLitros']
    });
  }
});

export type PresupuestoInput = z.infer<typeof presupuestoInputSchema>;

