# limpiezasuelosradiantes.com

Landing + calculadora técnica (Astro SSR + Tailwind) para generar presupuesto en **PDF** y enviarlo por email.

## Stack

- Astro SSR (adaptador Node standalone)
- Tailwind CSS
- Astro Islands (React) para formulario por pasos
- PDF en servidor: `@react-pdf/renderer`
- Email: Resend

## Variables de entorno

Copia `.env.example` a `.env` y completa:

- `RESEND_API_KEY`
- `FROM_EMAIL` (dominio verificado en Resend)
- `ADMIN_EMAIL`

## Desarrollo

```bash
npm run dev
```

## Endpoint

- `POST /api/presupuesto`
  - body `multipart/form-data` (recomendado, permite fotos) o JSON
  - campos mínimos:
    - `m2`
    - `ultimaLimpieza`
    - `antiguedadInstalacion`
    - `colectores`
    - `provincia`
    - `depositoInercia` (`si`/`no`) y `depositoLitros` cuando aplique
    - `contacto_nombre`, `contacto_email`, `contacto_telefono` (opcional)
    - `fotos` (opcional, múltiples)

## Producción en VPS

```bash
npm ci
npm run build
npm run start
```

La app SSR arranca con `node dist/server/entry.mjs` (script `start`).

```json
{
  "m2": 120,
  "ultimaLimpieza": "7+",
  "antiguedadInstalacion": "8-12",
  "colectores": 2,
  "provincia": "Madrid",
  "depositoInercia": "si",
  "depositoLitros": 50,
  "contacto": { "email": "cliente@correo.com", "nombre": "Cliente", "telefono": "+34 600 000 000" }
}
```

Devuelve el PDF (download) y lo envía por email al cliente y al administrador.

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
