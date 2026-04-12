import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EstadoFactura, EstadoPresupuesto, EstadoSolicitud, EstadoTrabajo, EstadoVisita, TipoServicio, TipoVisita } from '@/types';

export const formatEuro = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    Number.isFinite(n) ? n : 0
  );

export const formatDate = (s?: string | null) =>
  s ? format(new Date(s), 'dd/MM/yyyy', { locale: es }) : '-';

export const formatDateTime = (s?: string | null) =>
  s ? format(new Date(s), 'dd/MM/yyyy HH:mm', { locale: es }) : '-';

export const tipoServicioLabel = (t?: TipoServicio) =>
  t === 'preventivo'
    ? 'Tratamiento preventivo'
    : t === 'prelavado_lavado'
      ? 'Con prelavado'
      : t === 'intensiva_dia'
        ? 'Intensiva 1 día'
        : '-';

export const estadoLabel = (
  e?: EstadoTrabajo | EstadoVisita | EstadoPresupuesto | EstadoFactura | EstadoSolicitud
) => (e ? e.replaceAll('_', ' ') : '-');

export const tipoVisitaLabel = (t?: TipoVisita) =>
  t === 'prelavado'
    ? 'Prelavado'
    : t === 'lavado'
      ? 'Lavado'
      : t === 'visita_aditivado'
        ? 'Visita de aditivado'
        : t === 'limpieza_en_el_dia'
          ? 'Limpieza en el día'
          : t === 'visita_anual'
            ? 'Visita anual'
            : '-';
