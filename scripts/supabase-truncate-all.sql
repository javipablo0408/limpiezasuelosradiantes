-- =============================================================================
-- PELIGRO: borra datos de negocio en public. Ejecutar solo en dev/staging o
-- cuando estés 100% seguro. Revisa antes en el SQL Editor de Supabase.
--
-- NO incluye auth.users (Supabase Auth): eso se gestiona desde Authentication.
--
-- tarifas_tramo: por defecto NO se toca (tabla de referencia de precios).
-- empresa: por defecto SÍ se vacía; descomenta el bloque alternativo si quieres conservarla.
-- =============================================================================

BEGIN;

-- Opcional: conservar la fila de empresa (descomenta y comenta el TRUNCATE de empresa abajo)
-- (no hace falta si luego reinsertas empresa a mano)

TRUNCATE TABLE
  public.informes_servicio,
  public.visitas,
  public.presupuesto_lineas,
  public.presupuestos,
  public.factura_lineas,
  public.facturas,
  public.trabajos,
  public.inmuebles,
  public.solicitudes,
  public.clientes,
  public.usuarios,
  public.empresa
RESTART IDENTITY CASCADE;

-- Si también quieres vaciar tarifas (no recomendado en prod):
-- TRUNCATE TABLE public.tarifas_tramo RESTART IDENTITY CASCADE;

COMMIT;

-- Tras esto, tendrás que volver a crear empresa, usuarios panel, clientes, etc.
