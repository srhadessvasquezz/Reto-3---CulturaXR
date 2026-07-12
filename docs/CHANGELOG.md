# Registro de Cambios

## [0.5.0] — 2026-07-12

### Agregado
- **Foto por gesto** — sostener 4 dedos ~2.25s frente a la cámara dispara
  `PhotoCaptureFlow`: cuenta regresiva (3→2→1), flash blanco, composición
  (video + canvas 3D + marca de agua "CULTURAXR") y descarga del PNG.
- **Botón de foto** — alternativa táctil para el mismo flujo de captura.
- **ActionMenu** — menú flotante con "Reiniciar posición" y "Volver al menú
  principal", invocable por gesto de 3 dedos (flanco de subida) o por botón.
- **Marco azteca inmersivo** — 4 bandas decorativas (`immersive-frame`)
  superpuestas al visor durante la experiencia.
- **Overlay de sitio** — nombre del modelo y ubicación geográfica fija en la
  esquina superior del visor (`site-overlay`), leída de `MODEL_INFO`.
- **`captureFrame()`** — utilidad que compone video espejado + canvas 3D +
  marca de agua con tipografía Poppins, retorna data URL PNG.
- **`downloadPng()`** — descarga un data URL como archivo `.png` vía Blob +
  object URL (evita límite de Chrome en data URLs grandes).
- **`TAKE_PHOTO`** — nueva variante en `GestureCommand` y `GestureMonitor`.
- **`onCanvasReady`** prop en `ModelViewer` — expone el `<canvas>` del
  renderer de Three.js para captura externa.
- **`preserveDrawingBuffer: true`** en el `Canvas` de R3F — necesario para
  que `toDataURL()` funcione tras cada frame.

### Cambiado
- **`CameraFeed`** — ahora acepta `videoRef` opcional (callback ref
  combinada con la ref interna) para que `PhotoCaptureFlow` pueda acceder
  al `<video>` y componer la captura.
- **`ImmersiveExperience`** — polling de gestos cada 100ms para detectar
  flanco de `TAKE_PHOTO` (con hold de 2.25s) y `PREVIOUS_MODEL` (toggle
  de menú). integra `PhotoCaptureFlow`, `ActionMenu`, marco y overlay.
- **`ModelViewer`** — clona la escena de `useGLTF` por montaje para que
  el reinicio de posición funcione correctamente (sin posición residual
  del cache de Three.js).
- **`global.css`** — estilos para `capture-countdown`, `capture-flash`,
  `capture-preview`, `immersive-frame`, `site-overlay`, `action-menu`.

## [0.4.1] — 2026-07-12

### Eliminado
- **Modelo Macuahuitl** — removido del proyecto: su tarjeta de invocación en
  `index.html`, su registro en `src/data/models.ts`, su ficha en
  `src/data/modelInfo.ts` y el archivo `public/3d_models/Macuahuitl.glb`.
  Quedan 3 invocaciones activas: Pirámide de San Andrés, Salvador del Mundo y
  Trompeta de Barro.

## [0.4.0] — 2026-07-12

### Agregado
- **3 modelos 3D nuevos** (merge de `origin/main`): `Macuahuitl.glb`,
  `Salvador del mundo.glb`, `trompeta de barro.glb` en `public/3d_models/`.
- Registro de los 3 modelos en `src/data/models.ts` (con rutas URL-encoded
  para los nombres con espacios) y fichas completas en `src/data/modelInfo.ts`.
- Las 3 tarjetas antes "Próximamente" ahora son invocaciones **activas**,
  cada una con su icono SVG, categoría e información propias:
  - **Macuahuitl** — arma de guerra mesoamericana (obsidiana).
  - **Salvador del Mundo** — monumento nacional de El Salvador.
  - **Trompeta de Barro** — instrumento ritual precolombino.

### Notas
- Cada modelo abre la experiencia inmersiva vía `data-model-id`; la info del
  visor y del panel "Ver información" se genera según el `id` del modelo.
- Verificado: los 4 `.glb` se sirven (200) y son glTF 2.0 válidos; type-check limpio.

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
