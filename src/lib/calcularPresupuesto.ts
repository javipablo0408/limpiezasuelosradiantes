import type {
  Antiguedad,
  ResultadoCalculo,
  TarifaTramo,
  TipoServicio,
  UltimaLimpieza
} from '@/types';

type Params = {
  m2: number;
  tiene_deposito: boolean;
  litros_deposito: number;
  antiguedad: Antiguedad;
  ultima_limpieza: UltimaLimpieza;
  provincia: string;
};

function getPrecio(
  tipoTarifa: TarifaTramo['tipo'],
  m2eq: number,
  tarifas: TarifaTramo[]
) {
  if (m2eq > 500 && tipoTarifa === 'aditivos') return +(0.94 * m2eq).toFixed(2);
  const tramo = tarifas
    .filter((t) => t.tipo === tipoTarifa && t.hasta_m2 >= m2eq)
    .sort((a, b) => a.hasta_m2 - b.hasta_m2)[0];
  return tramo?.precio ?? tarifas.filter((t) => t.tipo === tipoTarifa).at(-1)?.precio ?? 0;
}

/**
 * @param tipoContratado Si viene definido (p. ej. el `tipo_servicio` del trabajo), se usa ese tipo
 * para el desglose y totales y se ignora la regla automática mes/provincia/antigüedad.
 * Sirve para PDF y documentos alineados con lo contratado en el trabajo.
 */
export function calcularPresupuesto(
  params: Params,
  tarifas: TarifaTramo[],
  tipoContratado?: TipoServicio
): ResultadoCalculo {
  const m2eq = params.tiene_deposito
    ? params.m2 + params.litros_deposito
    : params.m2;

  const esFueraMadrid = !params.provincia.toLowerCase().includes('madrid');
  const mes = new Date().getMonth() + 1;
  const esTemporadaCalor = mes >= 4 && mes <= 9;

  let tipo: TipoServicio;
  if (tipoContratado) {
    tipo = tipoContratado;
  } else if (esFueraMadrid || esTemporadaCalor) {
    tipo = 'intensiva_dia';
  } else {
    const necesitaPrelavado =
      ['8_12', '13_mas'].includes(params.antiguedad) ||
      ['hace_5_mas', 'nunca'].includes(params.ultima_limpieza);
    tipo = necesitaPrelavado ? 'prelavado_lavado' : 'preventivo';
  }

  const lineas =
    tipo === 'intensiva_dia'
      ? [
          {
            descripcion: 'Limpieza intensiva en un día',
            precio: getPrecio('intensiva_dia', m2eq, tarifas),
            tipo: 'servicio_principal'
          },
          {
            descripcion: 'Aditivos 36+36+22',
            precio: getPrecio('aditivos', m2eq, tarifas),
            tipo: 'aditivos'
          }
        ]
      : tipo === 'prelavado_lavado'
        ? [
            {
              descripcion: 'Prelavado del circuito',
              precio: getPrecio('prelavado', m2eq, tarifas),
              tipo: 'servicio_principal'
            },
            {
              descripcion: 'Lavado completo del circuito',
              precio: getPrecio('lavado', m2eq, tarifas),
              tipo: 'servicio_principal'
            },
            {
              descripcion: 'Aditivos 36+36+22',
              precio: getPrecio('aditivos', m2eq, tarifas),
              tipo: 'aditivos'
            }
          ]
        : [
            {
              descripcion: 'Limpieza de tratamiento preventivo',
              precio: getPrecio('lavado', m2eq, tarifas),
              tipo: 'servicio_principal'
            },
            {
              descripcion: 'Aditivos 36+36+22',
              precio: getPrecio('aditivos', m2eq, tarifas),
              tipo: 'aditivos'
            }
          ];

  const subtotal = +lineas.reduce((s, l) => s + l.precio, 0).toFixed(2);
  const iva = +(subtotal * 0.21).toFixed(2);
  const total = +(subtotal + iva).toFixed(2);

  return { tipo, m2eq, lineas, subtotal, iva, total };
}
