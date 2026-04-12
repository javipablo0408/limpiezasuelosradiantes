export type RolUsuario = 'admin' | 'tecnico';
export type TipoCliente = 'particular' | 'promotora' | 'empresa';
export type TipoGenerador = 'caldera_gas' | 'aerotermia' | 'caldera_gasoil' | 'bomba_calor' | 'otro';
export type Antiguedad = 'menos_5' | '5_7' | '8_12' | '13_mas';
export type UltimaLimpieza = 'menos_1' | 'entre_1_3' | 'entre_3_5' | 'hace_5_mas' | 'nunca';
export type AnosSinLimpiar = 'menos_1' | 'entre_1_3' | 'entre_3_5' | 'hace_5_mas' | 'nunca' | 'no_recuerda';
export type TipoServicio = 'preventivo' | 'prelavado_lavado' | 'intensiva_dia';
export type EstadoTrabajo = 'presupuestado' | 'aceptado' | 'visita1_pendiente' | 'entre_visitas' | 'visita2_pendiente' | 'completado' | 'cancelado';
export type EstadoVisita = 'pendiente' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada';
export type TipoVisita = 'prelavado' | 'lavado' | 'visita_aditivado' | 'limpieza_en_el_dia' | 'visita_anual';
export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado' | 'caducado';
export type EstadoFactura = 'emitida' | 'enviada' | 'pagada' | 'vencida' | 'anulada';
export type EstadoSolicitud = 'nueva' | 'vista' | 'en_contacto' | 'convertida' | 'descartada';
export type TipoConcepto = 'servicio_principal' | 'aditivos' | 'desplazamiento' | 'otro';

export interface Empresa {
  id: string; nombre: string; nif?: string; direccion?: string;
  ciudad?: string; codigo_postal?: string; telefono?: string;
  email?: string; web?: string; iban?: string;
  logo_url?: string; condiciones_pdf?: string;
  created_at: string; updated_at: string;
}

export interface Usuario {
  id: string; nombre: string; email: string; telefono?: string;
  rol: RolUsuario; activo: boolean;
  created_at: string; updated_at: string;
}

export interface Cliente {
  id: string; tipo: TipoCliente; nombre: string; apellidos?: string;
  email?: string; telefono?: string; nif?: string;
  direccion?: string; ciudad?: string; codigo_postal?: string;
  provincia?: string; notas?: string; activo: boolean;
  created_at: string; updated_at: string;
}

export interface Inmueble {
  id: string; cliente_id: string;
  direccion: string; ciudad?: string; codigo_postal: string;
  provincia: string;
  es_comunidad_madrid: boolean;
  m2: number; tipo_generador: TipoGenerador;
  tiene_deposito: boolean; litros_deposito: number;
  m2_equivalentes: number;
  num_colectores: number;
  antiguedad: Antiguedad; ultima_limpieza: UltimaLimpieza;
  notas?: string; created_at: string; updated_at: string;
  clientes?: Cliente;
}

export interface Solicitud {
  id: string; nombre: string; email: string; telefono: string;
  es_comunidad_madrid?: boolean; codigo_postal: string; provincia?: string;
  m2: number; tipo_generador: TipoGenerador;
  tiene_deposito: boolean; litros_deposito: number;
  anos_sin_limpiar: AnosSinLimpiar; es_urgente: boolean;
  fotos_sala_tecnica?: string[]; fotos_colectores?: string[]; fotos_otras?: string[];
  tipo_servicio_calc?: TipoServicio; m2_equivalentes_calc?: number;
  precio_estimado?: number;
  estado: EstadoSolicitud; notas_internas?: string; trabajo_id?: string;
  created_at: string; updated_at: string;
}

export interface Trabajo {
  id: string; inmueble_id: string; solicitud_id?: string;
  tipo_servicio: TipoServicio; es_urgente: boolean;
  estado: EstadoTrabajo; m2_equivalentes: number;
  subtotal?: number; iva: number; total?: number;
  presupuesto_pdf_url?: string;
  notas?: string; notas_internas?: string;
  created_at: string; updated_at: string;
  inmuebles?: Inmueble & { clientes?: Cliente };
}

export interface Visita {
  id: string; trabajo_id: string; tecnico_id?: string;
  tipo: TipoVisita; fecha_inicio?: string; fecha_fin?: string;
  duracion_horas?: number; estado: EstadoVisita;
  direccion_servicio?: string; notas_tecnico?: string;
  created_at: string; updated_at: string;
  usuarios?: Usuario;
  trabajos?: Trabajo & { inmuebles?: Inmueble & { clientes?: Cliente } };
}

export interface Presupuesto {
  id: string; numero: string; trabajo_id: string;
  fecha: string; fecha_validez?: string;
  estado: EstadoPresupuesto;
  subtotal: number; iva: number; total: number;
  notas?: string; notas_internas?: string;
  created_at: string; updated_at: string;
  trabajos?: Trabajo & { inmuebles?: Inmueble & { clientes?: Cliente } };
  presupuesto_lineas?: PresupuestoLinea[];
}

export interface PresupuestoLinea {
  id: string; presupuesto_id: string; orden: number;
  descripcion: string; cantidad: number;
  precio_unitario: number; descuento_pct: number; total: number;
}

export interface Factura {
  id: string; numero: string; trabajo_id: string;
  presupuesto_id?: string; fecha: string;
  estado: EstadoFactura;
  subtotal: number; iva: number; total: number; notas?: string;
  created_at: string; updated_at: string;
  trabajos?: Trabajo & { inmuebles?: Inmueble & { clientes?: Cliente } };
  factura_lineas?: FacturaLinea[];
}

export interface FacturaLinea {
  id: string; factura_id: string; orden: number;
  descripcion: string; cantidad: number;
  precio_unitario: number; descuento_pct: number; total: number;
  tipo_concepto?: TipoConcepto;
}

export interface InformeServicio {
  id: string; trabajo_id: string; visita_id?: string;
  pdf_url?: string; fecha: string; notas?: string;
  created_at: string;
}

export interface TarifaTramo {
  id: string;
  tipo: 'intensiva_dia' | 'prelavado' | 'lavado' | 'aditivos';
  hasta_m2: number; precio: number;
}

export interface ResultadoCalculo {
  tipo: TipoServicio;
  m2eq: number;
  lineas: { descripcion: string; precio: number; tipo: string }[];
  subtotal: number; iva: number; total: number;
}
