import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

type Props = {
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
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: '#0f172a' },
  title: { fontSize: 18, marginBottom: 12, fontWeight: 700 },
  block: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#475569' },
  value: { fontWeight: 700 },
  total: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#cbd5e1' }
});

function eur(n?: number | null) {
  const value = Number.isFinite(n ?? NaN) ? Number(n) : 0;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
}

export function WorkPresupuestoPdf(props: Props) {
  return (
    <Document title={`Presupuesto trabajo ${props.numeroTrabajo}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Presupuesto</Text>

        <View style={styles.block}>
          <View style={styles.row}><Text style={styles.label}>Trabajo</Text><Text style={styles.value}>{props.numeroTrabajo}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Fecha</Text><Text style={styles.value}>{props.fecha ?? '-'}</Text></View>
        </View>

        <View style={styles.block}>
          <View style={styles.row}><Text style={styles.label}>Cliente</Text><Text style={styles.value}>{props.clienteNombre}</Text></View>
          <View style={styles.row}><Text style={styles.label}>NIF</Text><Text style={styles.value}>{props.clienteNif ?? '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Dirección fiscal</Text><Text style={styles.value}>{props.clienteDireccion ?? '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Inmueble</Text><Text style={styles.value}>{props.inmuebleDireccion ?? '-'}</Text></View>
        </View>

        <View style={styles.block}>
          <View style={styles.row}><Text style={styles.label}>Subtotal</Text><Text style={styles.value}>{eur(props.subtotal)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>IVA</Text><Text style={styles.value}>{eur(props.iva)}</Text></View>
          <View style={[styles.row, styles.total]}><Text style={styles.value}>Total</Text><Text style={styles.value}>{eur(props.total)}</Text></View>
        </View>

        {props.notas ? (
          <View style={styles.block}>
            <Text style={styles.label}>Notas</Text>
            <Text>{props.notas}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
