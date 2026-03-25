import React from 'react';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PresupuestoInput } from './schema';
import type { PresupuestoResult } from './calculate';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 36,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#0f172a'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  brandBox: {
    width: 112,
    height: 56,
    justifyContent: 'center'
  },
  brandLogo: { width: 112, height: 56, objectFit: 'contain' },
  brandTitle: { fontSize: 12, fontWeight: 700 },
  docTitle: { fontSize: 18, fontWeight: 700, marginTop: 2 },
  docMeta: { marginTop: 6, color: '#475569', fontSize: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 },
  grid2: { flexDirection: 'row', gap: 12 },
  col: { flexGrow: 1, flexBasis: 0 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  kvLabel: { color: '#475569' },
  kvValue: { fontWeight: 700, maxWidth: '62%', textAlign: 'right' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
    marginBottom: 6
  },
  th: { fontSize: 10, color: '#475569', fontWeight: 700 },
  row: { flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  cellLeft: { flexGrow: 1, flexBasis: 0 },
  cellRight: { width: 90, textAlign: 'right', fontWeight: 700 },
  totalBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalLabel: { fontSize: 11, color: '#9a3412' },
  totalValue: { fontSize: 12, fontWeight: 700, color: '#9a3412' },
  note: { marginTop: 6, fontSize: 10, color: '#475569', lineHeight: 1.35 },
  processText: { marginTop: 6, fontSize: 10, color: '#334155', lineHeight: 1.45 },
  footer: { position: 'absolute', bottom: 18, left: 36, right: 36, fontSize: 9, color: '#64748b' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumb: { width: 160, height: 110, objectFit: 'cover', borderWidth: 1, borderColor: '#e2e8f0' }
});

function eur(amount: number) {
  return `${amount.toFixed(0)} €`;
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function PresupuestoPdf(props: {
  input: PresupuestoInput;
  result: PresupuestoResult;
  quoteId: string;
  logoDataUri?: string;
  photos?: Array<{ dataUri: string; fileName: string }>;
}) {
  const { input, result, quoteId, logoDataUri, photos } = props;
  const dateStr = formatDate();
  const depositoL = input.depositoInercia === 'si' ? input.depositoLitros ?? 0 : 0;
  const effectiveM2 = input.m2 + depositoL;
  const processDescription = getProcessDescription(result.serviceType);

  return (
    <Document title={`Presupuesto suelo radiante - ${quoteId}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBox}>
            {logoDataUri ? <Image src={logoDataUri} style={styles.brandLogo} /> : <Text style={styles.brandTitle}>TSV Servicios</Text>}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.docTitle}>Presupuesto técnico</Text>
            <Text style={styles.docMeta}>Fecha: {dateStr}</Text>
            <Text style={styles.docMeta}>Referencia: {quoteId}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Cliente</Text>
        <View style={styles.card}>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Nombre</Text>
                <Text style={styles.kvValue}>{input.contacto.nombre}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Email</Text>
                <Text style={styles.kvValue}>{input.contacto.email}</Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Provincia</Text>
                <Text style={styles.kvValue}>{input.provincia}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Teléfono</Text>
                <Text style={styles.kvValue}>{input.contacto.telefono ?? '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Datos del sistema</Text>
        <View style={styles.card}>
          <View style={styles.grid2}>
            <View style={styles.col}>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Superficie</Text>
                <Text style={styles.kvValue}>
                  {effectiveM2} m² {depositoL > 0 ? `(eq. ${input.m2} + ${depositoL}L)` : ''}
                </Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Última limpieza</Text>
                <Text style={styles.kvValue}>{input.ultimaLimpieza}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Depósito de inercia</Text>
                <Text style={styles.kvValue}>
                  {input.depositoInercia === 'si'
                    ? `${input.depositoLitros ?? '—'} L`
                    : input.depositoInercia === 'no'
                      ? 'No'
                      : '—'}
                </Text>
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Colectores</Text>
                <Text style={styles.kvValue}>{input.colectores}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Antigüedad instalación</Text>
                <Text style={styles.kvValue}>{input.antiguedadInstalacion}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.kvLabel}>Alcance</Text>
                <Text style={styles.kvValue}>{result.serviceTitle}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Desglose del servicio</Text>
        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.cellLeft]}>Concepto</Text>
            <Text style={[styles.th, styles.cellRight]}>Importe</Text>
          </View>
          {result.lineItems.map((li) => (
            <View key={li.label} style={styles.row}>
              <Text style={styles.cellLeft}>{li.label}</Text>
              <Text style={styles.cellRight}>{eur(li.amountEur)}</Text>
            </View>
          ))}

          <View style={styles.totalBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{eur(result.subtotalEur)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>IVA ({Math.round(result.ivaRate * 100)}%)</Text>
              <Text style={styles.totalValue}>{eur(result.ivaEur)}</Text>
            </View>
            <View style={[styles.totalLine, { marginTop: 2 }]}>
              <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 700 }]}>Total</Text>
              <Text style={[styles.totalValue, { fontSize: 14 }]}>{eur(result.totalEur)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Proceso seleccionado</Text>
        <View style={styles.card}>
          {processDescription.map((line) => (
            <Text key={line} style={styles.processText}>
              {line}
            </Text>
          ))}
        </View>

        {photos && photos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Fotos aportadas</Text>
            <View style={styles.card}>
              <View style={styles.photoGrid}>
                {photos.map((p) => (
                  <Image key={p.fileName} src={p.dataUri} style={styles.photoThumb} />
                ))}
              </View>
            </View>
          </>
        ) : null}

        <Text style={styles.footer}>
          Este documento es una estimación automatizada. La intervención final se confirma tras verificación de accesos y
          estado real del sistema. Ref: {quoteId}
        </Text>
      </Page>
    </Document>
  );
}

function getProcessDescription(serviceType: PresupuestoResult['serviceType']) {
  if (serviceType === 'prelavado_lavado') {
    return [
      'Limpieza con prelavado (para instalaciones muy sucias o sin adecuado mantenimiento).',
      '1ª En los casos en que está muy sucio el circuito hay que hacer un lavado de la instalación con máquinas, previo a la introducción del detergente ya que el exceso de suciedad puede neutralizar el producto químico de limpieza.',
      'La duración de este prelavado puede llegar a ser todo el día dependiendo del estado de la instalación y sus dimensiones. El promedio es de aproximadamente de 1h y 1/2 por cada 100m2.',
      '2ª Visita, con una duración aproximada de dos horas por cada 100m2, en la que se realizará propiamente la limpieza del circuito, con diferentes máquinas; unas para desprender la suciedad incrustada y otras de gran caudal para hacer circular el agua en ambos sentidos y extraemos con un filtro magnético todas las partículas en suspensión.',
      '- Limpiamos colectores, comprobamos y engrasamos válvulas para su correcto funcionamiento.',
      '- Comprobamos con cámara térmica que los circuitos calientan.',
      '- Una vez que el circuito esté limpio introducimos los líquidos protectores y comprobamos que los parámetros; turbidez, ph y conductividad del agua, son los adecuados.',
      '* Nuestros presupuestos incluyen informe de la actuación y visita de revisión gratuita transcurrido un año.'
    ];
  }

  if (serviceType === 'intensiva_dia') {
    return [
      'LIMPIEZA INTENSIVA EN UN DIA.',
      'Este tipo solo se realiza en casos excepcionales por ejemplo cuando: hay que sustituir caldera o aerotermia y se quiere dejar limpia la instalación de forma urgente; no funciona la caldera y hay que utilizar un filtro con resistencia; hay obturación por falta de mantenimiento; instalaciones fuera de nuestra área de trabajo; otros.',
      'Tipo de actuación:',
      '1) Prelavamos el circuito para extraer la suciedad acumulada para que actúen mejor los limpiadores.',
      '2) Comprobamos el estado del agua (ph, turbidez, conductividad, etc...), y de la instalación, e introducimos los líquidos de limpieza rápida. Hacemos circular el agua con la calefacción puesta.',
      '3) Realizamos la limpieza del circuito, con diferentes máquinas; unas para desprender la suciedad incrustada y otras de gran caudal para hacer circular el agua en ambos sentidos y arrastrar las partículas en suspensión que atraparemos con filtro magnético.',
      '4) Limpiamos colectores, comprobamos y engrasamos válvulas para su correcto funcionamiento y comprobamos con cámara térmica que los circuitos calientan.',
      '5) Una vez que el circuito esté limpio introducimos los líquidos protectores y comprobamos que los parámetros; turbidez, ph y conductividad del agua, son los adecuados.',
      '* Nuestros presupuestos incluyen informe de la actuación y visita de revisión gratuita transcurrido un año.'
    ];
  }

  return [
    'Limpieza de tratamiento preventivo (la recomendada, normalmente, para instalaciones de menos de 5 años de antigüedad o que se les ha hecho un tratamiento no hace más de 5 años).',
    '1ª Visita de alrededor de 30 minutos para comprobar estado del agua e inspeccionar la instalación antes de introducir los líquidos limpiadores que se dejarán actuar, con la calefacción puesta durante 15 o 20 días, en función de las necesidades.',
    '2ª Visita, con una duración aproximada de dos horas por cada 100m2, en la que se realizará propiamente la limpieza del circuito, con diferentes máquinas; unas para desprender la suciedad incrustada y otras de gran caudal para hacer circular el agua en ambos sentidos y extraemos con un filtro magnético todas las partículas en suspensión.',
    '- Limpiamos colectores, comprobamos y engrasamos válvulas para su correcto funcionamiento.',
    '- Comprobamos con cámara térmica que los circuitos calientan.',
    '- Una vez que el circuito esté limpio introducimos los líquidos protectores y comprobamos que los parámetros; turbidez, ph y conductividad del agua, son los adecuados.',
    '* Nuestros presupuestos incluyen informe de la actuación y visita de revisión gratuita transcurrido un año.'
  ];
}

