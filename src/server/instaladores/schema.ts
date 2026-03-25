import { z } from 'zod';

export const instaladorInputSchema = z.object({
  emailEmpresa: z.string().email().optional(),
  nombre: z.string().min(1).max(80),
  apellidos: z.string().max(120).optional(),
  nombreEmpresa: z.string().min(1).max(160),
  cif: z.string().min(6).max(32),
  direccion1: z.string().min(3).max(160),
  direccion2: z.string().max(160).optional(),
  ciudad: z.string().min(2).max(80),
  region: z.string().min(2).max(80),
  codigoPostal: z.string().min(4).max(16),
  pais: z.string().min(2).max(80),
  telefono: z.string().min(6).max(30),
  email: z.string().email()
});

export type InstaladorInput = z.infer<typeof instaladorInputSchema>;

