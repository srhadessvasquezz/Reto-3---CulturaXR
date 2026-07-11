# Registro de Cambios

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
