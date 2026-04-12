-- =============================================================================
-- Tras vaciar tablas: Authentication sigue teniendo el usuario, pero
-- public.usuarios puede estar vacío. El panel exige una fila activa con el
-- MISMO email que en Supabase Auth.
--
-- Supabase → SQL Editor → pega y ejecuta. Cambia el email si hace falta.
-- =============================================================================

INSERT INTO public.usuarios (nombre, email, rol, activo)
SELECT 'Administrador', 'javipablo0408@gmail.com', 'admin', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios u WHERE lower(u.email) = lower('javipablo0408@gmail.com')
);

UPDATE public.usuarios
SET activo = true,
    rol = 'admin',
    nombre = COALESCE(NULLIF(trim(nombre), ''), 'Administrador')
WHERE lower(email) = lower('javipablo0408@gmail.com');

-- Comprueba:
-- SELECT id, nombre, email, rol, activo FROM public.usuarios WHERE lower(email) = lower('javipablo0408@gmail.com');
