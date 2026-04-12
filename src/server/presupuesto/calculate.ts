import type { PresupuestoInput } from './schema';

export type PresupuestoLineItem = {
  label: string;
  amountEur: number;
};

export type PresupuestoResult = {
  subtotalEur: number;
  ivaRate: number;
  ivaEur: number;
  totalEur: number;
  serviceType: 'preventivo' | 'prelavado_lavado' | 'intensiva_dia';
  serviceTitle: string;
  lineItems: PresupuestoLineItem[];
  notes: string[];
};

function roundToEur(value: number) {
  return Math.round(value * 100) / 100;
}

function isMadrid(provincia: string) {
  return provincia.trim().toLowerCase().includes('madrid');
}

function effectiveSurfaceM2(input: PresupuestoInput) {
  const depositoL = input.depositoInercia === 'si' ? input.depositoLitros ?? 0 : 0;
  // Regla de negocio: por "m²" se entiende m² + litros del depósito de inercia
  return input.m2 + depositoL;
}

function priceForTramo(areaM2: number, tramos: Array<{ max: number; price: number }>) {
  for (const t of tramos) {
    if (areaM2 <= t.max) return t.price;
  }
  // Si cae por encima del último tramo, devolvemos el precio del último (normalmente ya se
  // define el "cap" con el max más alto).
  return tramos[tramos.length - 1]?.price ?? 0;
}

function limpiezaEnDiaPrice2026(areaM2: number) {
  // Tabla: "Limpieza en un día"
  return priceForTramo(areaM2, [
    { max: 100, price: 450 },
    { max: 150, price: 530 },
    { max: 200, price: 590 },
    { max: 250, price: 650 },
    { max: 300, price: 700 },
    { max: 350, price: 700 },
    { max: 400, price: 800 },
    { max: 500, price: 1000 }
  ]);
}

function prelavadoPrice2026(areaM2: number) {
  // Tabla: "Prelavado"
  return priceForTramo(areaM2, [
    { max: 100, price: 200 },
    { max: 150, price: 250 },
    { max: 200, price: 300 },
    { max: 250, price: 350 },
    { max: 300, price: 350 },
    { max: 350, price: 350 },
    { max: 400, price: 400 },
    { max: 500, price: 500 }
  ]);
}

function lavadoPrice2026(areaM2: number) {
  // Tabla: "Lavado"
  return priceForTramo(areaM2, [
    { max: 100, price: 250 },
    { max: 150, price: 280 },
    { max: 200, price: 290 },
    { max: 250, price: 300 },
    { max: 300, price: 350 },
    { max: 350, price: 350 },
    { max: 400, price: 400 },
    { max: 500, price: 500 }
  ]);
}

function aditivos36Price2026(areaM2: number) {
  // Tabla: "Aditivos 36+36+22"
  // - hasta 500m2: valores por tramos
  // - >500m2: "94€*X" (con X = m²/100 en la práctica). Redondeamos al euro.
  const tramo = priceForTramo(areaM2, [
    { max: 100, price: 94 },
    { max: 150, price: 141 },
    { max: 200, price: 188 },
    { max: 250, price: 235 },
    { max: 300, price: 282 },
    { max: 350, price: 329 },
    { max: 400, price: 376 },
    { max: 500, price: 475 }
  ]);

  if (areaM2 <= 500) return tramo;
  return 0.94 * areaM2; // 94€ * (areaM2/100)
}

export function calculatePresupuesto(input: PresupuestoInput): PresupuestoResult {
  const effectiveM2 = effectiveSurfaceM2(input);

  // Filas usadas según tu tabla de precios.
  // - Se elige entre "Limpieza en un día" o ("Prelavado" + "Lavado") / "Lavado"
  // - Siempre se añade "Aditivos 36+36+22"
  //
  // Reglas que me indicaste:
  // - "Limpieza en un día" aplica a todo lo fuera de Madrid o si es temporada de calor (abril-septiembre).
  // - "Prelavado" aplica si han pasado 7+ años desde la última limpieza
  //   (o nunca se ha realizado) o si la instalación tiene >7 años.
  // - Si hay prelavado, también se aplica "Lavado".
  // - "Lavado" aplica en el resto de casos.
  const month = new Date().getMonth() + 1; // 1..12
  const warmSeason = month >= 4 && month <= 9;
  const outsideOrHeat = !isMadrid(input.provincia) || warmSeason;
  const oldInstall = input.antiguedadInstalacion === '8-12' || input.antiguedadInstalacion === '13+';
  const oldLastClean = input.ultimaLimpieza === '7+' || input.ultimaLimpieza === 'nunca';
  const needsPrelavado = oldInstall || oldLastClean;

  let limpiezaEnDia = 0;
  let prelavado = 0;
  let lavado = 0;
  let serviceType: PresupuestoResult['serviceType'] = 'preventivo';
  let serviceTitle = 'Limpieza de tratamiento preventivo';

  if (outsideOrHeat) {
    limpiezaEnDia = limpiezaEnDiaPrice2026(effectiveM2);
    serviceType = 'intensiva_dia';
    serviceTitle = 'LIMPIEZA INTENSIVA EN UN DIA';
  } else if (needsPrelavado) {
    prelavado = prelavadoPrice2026(effectiveM2);
    lavado = lavadoPrice2026(effectiveM2);
    serviceType = 'prelavado_lavado';
    serviceTitle = 'Limpieza con prelavado';
  } else {
    lavado = lavadoPrice2026(effectiveM2);
    serviceType = 'preventivo';
    serviceTitle = 'Limpieza de tratamiento preventivo';
  }

  const aditivos36 = aditivos36Price2026(effectiveM2);

  // Colectores: dato informativo, sin impacto en precio

  const lineItems: PresupuestoLineItem[] = [];
  if (outsideOrHeat) {
    lineItems.push({
      label: 'Limpieza en un día',
      amountEur: roundToEur(limpiezaEnDia)
    });
  } else if (needsPrelavado) {
    lineItems.push({ label: 'Prelavado', amountEur: roundToEur(prelavado) });
    lineItems.push({ label: 'Lavado', amountEur: roundToEur(lavado) });
  } else {
    lineItems.push({ label: 'Lavado', amountEur: roundToEur(lavado) });
  }

  lineItems.push({ label: 'Aditivos 36+36+22', amountEur: roundToEur(aditivos36) });

  const subtotalEur = roundToEur(lineItems.reduce((acc, x) => acc + x.amountEur, 0));
  const ivaRate = 0.21;
  const ivaEur = roundToEur(subtotalEur * ivaRate);
  const totalEur = roundToEur(subtotalEur + ivaEur);

  const notes = [
    `Estimación automatizada basada en m² equivalentes = m² + litros del depósito de inercia. Tipo de servicio: ${serviceTitle}.`,
    'Se confirma tras verificación de accesos y estado real de la instalación.',
    'Regla de prelavado: se aplica si la última limpieza es de 7+ años (o nunca se realizó) o si la instalación tiene más de 7 años.',
    'El número de colectores se recoge como dato técnico y no modifica el cálculo económico.',
    'Se recomienda: instalación de filtro magnético + inhibidor para mantener rendimiento tras la limpieza.'
  ];

  return { subtotalEur, ivaRate, ivaEur, totalEur, serviceType, serviceTitle, lineItems, notes };
}

