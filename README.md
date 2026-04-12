# limpiezasuelosradiantes.com

Landing + calculadora técnica (Astro SSR + Tailwind) para generar presupuesto en PDF y enviar notificaciones por email.

## Stack

- Astro SSR (adaptador Node standalone)
- Tailwind CSS
- Astro Islands (React) para formulario por pasos
- PDF en servidor: `@react-pdf/renderer`
- Email: Resend
- Persistencia de formularios: SQLite (`sqlite3`)

## Cálculo de servicios y tarifas (presupuesto automático)

Esta sección documenta la lógica real implementada en `src/server/presupuesto/calculate.ts`.

### 1) Base de cálculo: m² equivalentes

La superficie usada para tarifar no son solo los m² de vivienda:

- Si **NO** hay depósito de inercia: `m2_equivalentes = m2`
- Si **SÍ** hay depósito de inercia: `m2_equivalentes = m2 + litros_deposito`

Ejemplo: 120 m² + depósito de 80 L => 200 m² equivalentes.

### 2) Cómo se decide el tipo de servicio

El sistema elige automáticamente un tipo de servicio principal:

1. **Limpieza intensiva en un día** (`intensiva_dia`) si:
   - la provincia no contiene "madrid" (insensible a mayúsculas), **o**
   - estamos en temporada de calor (**abril a septiembre**, ambos incluidos).
2. Si no aplica lo anterior, se evalúa si necesita prelavado:
   - instalación con antigüedad `8-12` o `13+`, **o**
   - última limpieza `7+` o `nunca`.
3. Si necesita prelavado => **Limpieza con prelavado** (`prelavado_lavado`):
   - se cobra `Prelavado` + `Lavado`.
4. En el resto de casos => **Limpieza de tratamiento preventivo** (`preventivo`):
   - se cobra `Lavado`.

Siempre se añade la línea de **Aditivos 36+36+22**.

### 3) Tarifas 2026 por tramos

Las siguientes tablas se aplican sobre `m2_equivalentes`.

#### Limpieza en un día

| Hasta m² | Precio (€) |
|---:|---:|
| 100 | 450 |
| 150 | 530 |
| 200 | 590 |
| 250 | 650 |
| 300 | 700 |
| 350 | 700 |
| 400 | 800 |
| 500 | 1000 |

#### Prelavado

| Hasta m² | Precio (€) |
|---:|---:|
| 100 | 200 |
| 150 | 250 |
| 200 | 300 |
| 250 | 350 |
| 300 | 350 |
| 350 | 350 |
| 400 | 400 |
| 500 | 500 |

#### Lavado

| Hasta m² | Precio (€) |
|---:|---:|
| 100 | 250 |
| 150 | 280 |
| 200 | 290 |
| 250 | 300 |
| 300 | 350 |
| 350 | 350 |
| 400 | 400 |
| 500 | 500 |

#### Aditivos 36+36+22

| Hasta m² | Precio (€) |
|---:|---:|
| 100 | 94 |
| 150 | 141 |
| 200 | 188 |
| 250 | 235 |
| 300 | 282 |
| 350 | 329 |
| 400 | 376 |
| 500 | 475 |

Para superficies **> 500 m²**:

- `aditivos = 0.94 * m2_equivalentes` (equivale a 94 €/cada 100 m²)

### 4) Cálculo económico final

- `subtotal = suma(lineas_servicio)`
- `iva = subtotal * 0.21`
- `total = subtotal + iva`
- Todos los importes se redondean a 2 decimales.

### 5) Textos de cada servicio (catálogo comercial)

Estos son los textos base mostrados en la landing y usados como referencia comercial del servicio.

#### Servicio: Limpieza de tratamiento preventivo

Descripción corta:

- Recomendada normalmente para instalaciones de menos de 5 años o con tratamiento reciente.

Alcance:

- 1ª visita (~30 min): comprobación del estado del agua e inspección de la instalación.
- Se introducen líquidos limpiadores y se dejan actuar con calefacción encendida durante 15-20 días (según necesidades).
- 2ª visita (~2 h por cada 100 m²): limpieza del circuito con maquinaria específica.
- Limpieza de colectores, revisión/engrase de válvulas y verificación con cámara térmica.
- Introducción de líquidos protectores y verificación de parámetros (turbidez, pH, conductividad).
- Incluye informe de actuación y visita de revisión gratuita al año.

#### Servicio: Limpieza con prelavado

Descripción corta:

- Para instalaciones muy sucias o sin mantenimiento adecuado.

Alcance:

- Prelavado inicial con máquinas para retirar exceso de suciedad y evitar neutralización del químico de limpieza.
- Duración orientativa del prelavado: media de ~1,5 h por cada 100 m² (puede alargarse según estado).
- Segunda fase de lavado completo (~2 h por cada 100 m²) con limpieza mecánica e hidráulica en ambos sentidos.
- Extracción de partículas metálicas y lodos con filtrado magnético.
- Limpieza de colectores, revisión/engrase de válvulas y comprobación térmica.
- Aporte de protectores finales para estabilizar el circuito frente a corrosión y crecimiento bacteriano.
- Incluye informe de actuación y visita de revisión gratuita al año.

#### Servicio: Limpieza intensiva en un día

Descripción corta:

- Servicio excepcional para casos urgentes o especiales (por ejemplo sustitución de caldera/aerotermia, obturaciones severas o instalaciones fuera de zona).

Alcance:

1. Prelavado para retirar suciedad acumulada.
2. Medición de estado del agua e introducción de líquidos de limpieza rápida.
3. Limpieza con máquinas de alto caudal y filtro magnético para arrastre y extracción de residuos.
4. Limpieza de colectores, ajuste de válvulas y comprobación con cámara térmica.
5. Aporte de protectores finales y verificación de parámetros del agua.

Incluye informe de actuación y visita de revisión gratuita al año.

### 6) Notas técnicas del presupuesto

- El número de colectores se registra como dato técnico, actualmente **no altera el precio**.
- La salida del cálculo incluye notas de validación y recomendaciones preventivas.
- El presupuesto automático es una estimación; se confirma tras revisión de accesos y estado real de la instalación.

## Variables de entorno

Copia `.env.example` a `.env` y completa:

- `RESEND_API_KEY`
- `FROM_EMAIL` (dominio verificado en Resend)
- `ADMIN_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (clave de servidor; no usar anon key)
- `ADMIN_USER`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_CALENDAR_TIMEZONE` (por defecto `Europe/Madrid`)

### Generar hash de contraseña admin

```bash
node -e "const{randomBytes,scryptSync}=require('crypto');const p=process.argv[1];const s=randomBytes(16).toString('hex');console.log('scrypt$'+s+'$'+scryptSync(p,s,64).toString('hex'))" "TU_PASSWORD_SEGURA"
```

Pega el resultado en `ADMIN_PASSWORD_HASH`.

### Generar secreto de sesión

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Pega el resultado en `ADMIN_SESSION_SECRET`.

### Esquema mínimo en Supabase (admin)

Este proyecto ahora guarda formularios y agenda en Supabase. Debes tener estas tablas en `public`:

- `submissions`
- `submission_files`
- `appointments`
- `calendar_sync_logs`

Campos esperados (nombres exactos): mismos usados en `src/server/admin/repository.ts` (`snake_case`).

### Configurar Google Calendar (agenda de citas)

1. Crea una Service Account en Google Cloud.
2. Activa la API de Google Calendar.
3. Comparte tu calendario con el email de la Service Account con permisos de edición.
4. Configura en `.env`:
   - `GOOGLE_CALENDAR_ID` (id del calendario)
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (con saltos de línea escapados como `\n`)
   - `GOOGLE_CALENDAR_TIMEZONE`

## Desarrollo

```bash
npm run dev
```

## Producción en VPS

```bash
npm ci
npm run build
npm run start
```

La app SSR arranca con `node dist/server/entry.mjs` (script `start`).

## API pública

- `POST /api/presupuesto`
  - body `multipart/form-data` (recomendado, permite fotos) o JSON
- `POST /api/domotica-consulta`
- `POST /api/instaladores`

Los envíos validados se guardan en SQLite y después se procesa el envío de email (y PDF en el caso de presupuesto).

## Panel Admin de Formularios

- Login: `/admin/login`
- Listado: `/admin`
- Alias legacy: `/admin/panel` (redirige a `/admin`)
- Detalle: `/admin/submissions/:id`
- Calendario de citas: `/admin/calendario`
- API interna protegida:
  - `GET /api/admin/submissions`
  - `GET /api/admin/submissions/:id`
  - `GET /api/admin/appointments`

### Flujo aprobación y agenda

1. Abres un presupuesto en `/admin/submissions/:id`.
2. Lo marcas como `aprobado`.
3. Creas cita (inicio, fin, técnico, notas).
4. Se guarda en SQLite y se intenta sincronizar en Google Calendar.
5. La cita aparece en `/admin/calendario`.

Si faltan variables de admin, el área `/admin` devuelve estado 503 con mensaje de configuración.
