# Registro de Cambios

## [0.3.0] — 2026-07-12

### Cambiado
- **Landing unificada** — se fusionaron las dos landings en `index.html`: la
  estructura del sitio + la estética nocturna de leyendas (niebla, luciérnagas,
  motor de sonido Web Audio, aparición al hacer scroll) de `culturaxr.html`,
  ahora conectada a React (montaje en `#root` vía `/src/main.tsx`).
- `index.html` usa `culturaxr.css` como hoja principal (antes `estilo.css`).
- Sección "Invoca la experiencia" con grilla de 4 invocaciones (4 → 2 → 1
  columnas según ancho, sin fila huérfana).

### Agregado
- **Invocación Pirámide de San Andrés** — tarjeta activa con `data-model-id="piramide"`;
  `App.tsx` la detecta y abre la experiencia inmersiva (cámara + gestos + 3D).
- **3 invocaciones placeholder** (El Cipitío, La Siguanaba, El Cadejo) en estado
  `locked` / "Próximamente" — aún sin modelo asignado.
- Estilos de estado en `culturaxr.css`: `.badge`, `.card--activa`, `.card.locked`,
  `.btn-invoke.is-disabled`, animación `shake-soft`.
- Firma sonora `piramide()` y tono `denied()` para invocaciones no disponibles.

### Notas
- `culturaxr.html` queda como referencia; la landing servida por Vite es `index.html`.
- Se conserva el `<script>` de MediaPipe Hands por CDN (lo usa `HandOverlay` vía `window.Hands`).

## [0.2.0] — 2026-07-11

### Agregado
- **Backend Express** (`server/`) con API REST para modelos 3D.
- **Registro JSON de modelos** (`server/models.json`) — agregar modelos editando un solo archivo.
- **`GET /api/models`** — endpoint que devuelve la lista de modelos disponibles.
- **`GET /api/models/:id`** — endpoint que devuelve un modelo individual.
- **`GET /3d_models/{archivo}`** — servido estático de archivos GLB.
- **Hook `useModels`** — fetch de modelos con estados loading/error.
- **Hook `useModelDetail`** — fetch de un modelo individual por ID.
- **Componente `ModelList`** — grid de tarjetas con estados vacío/carga/error.
- **Componente `ModelCard`** — tarjeta individual con categoría, nombre y descripción.
- **Componente `ModelViewer`** — visor 3D con Three.js (R3F) y placeholder wireframe.
- **Proxy de Vite** (`/api` y `/3d_models` → backend) para desarrollo fluido.
- **Script `dev` con concurrently** — levanta backend + frontend de una vez.
- **Documentación actualizada** (ARCHITECTURE.md, DECISIONS.md, CHANGELOG.md).

### Cambiado
- `src/App.tsx` — ahora integra sidebar con lista de modelos y visor 3D.
- `src/styles/global.css` — estilos completos para layout, tarjetas y visor.
- `package.json` raíz — agregados scripts `dev:server`, `dev:client`, `start`, dependencia `concurrently`.

## [0.1.0] — 2026-07-11

### Agregado
- Esqueleto del proyecto con React 19 + Vite 6 + TypeScript 5.
- Three.js y React Three Fiber (dependencias).
- MediaPipe Hands (dependencia).
- Estructura de carpetas (`components/`, `hooks/`, `utils/`, `styles/`, `docs/`).
- Estilos base y punto de entrada.
- Documentación inicial: ARCHITECTURE.md, DECISIONS.md, CHANGELOG.md.
- CI/CD para GitHub Pages.
