# Plan de Migración: MediaPipe Hands (CDN → tasks-vision)

## Diagnóstico — Problemas de la implementación actual

| # | Problema | Impacto |
|---|---|---|
| P1 | Dependencia de CDN (`cdn.jsdelivr.net/npm/@mediapipe/hands`) | No funciona offline; riesgo de outage si la CDN falla |
| P2 | API legacy (`window.Hands`, `@mediapipe/hands`) | Deprecada por Google; sin más actualizaciones ni mejoras |
| P3 | Modelo Lite (`modelComplexity: 0`) | Baja precisión en poca luz, oclusiones, fondos complejos |
| P4 | Bucle `requestAnimationFrame` sin esperar frames nuevos | Procesa cuadros repetidos, desperdicia GPU/CPU |
| P5 | Video oculto duplicado | HandOverlay crea un `<video>` independiente con el mismo stream → 2 decodificadores activos |
| P6 | Lecturas síncronas del DOM en el bucle (readyState, clientWidth) | Causa layout thrashing, penaliza FPS |
| P7 | Jugueteo de búsqueda de CDN (`waitForHands` con polling de 200ms) | Retrasa el inicio de la experiencia |

## Solución propuesta

Migrar a **`@mediapipe/tasks-vision`** (v0.10.x), la API oficial activa de MediaPipe, con:

- Modelo **Full** (`hand_landmarker.task`) para máxima robustez en condiciones adversas
- Delegado **GPU** para inferencia acelerada
- `requestVideoFrameCallback()` para sincronizar inferencia con frames reales de la cámara
- Video compartido con `CameraFeed` (un solo decodificador)
- Archivos WASM y modelo servidos desde `public/mediapipe/` (100% offline)
- Umbrales de confianza ajustados a 0.4 para entornos hostiles

## Arquitectura post-migración

```
public/mediapipe/
├── wasm/                          ← Copiado de node_modules/@mediapipe/tasks-vision/wasm/
│   ├── vision_wasm_internal.js
│   ├── vision_wasm_internal.wasm
│   └── vision_wasm_internal.simd.wasm
└── hand_landmarker.task           ← Descargado de MediaPipe Model Zoo (Full, float16)

src/
├── components/
│   ├── HandOverlay.tsx            ← Refactorizado: tasks-vision + requestVideoFrameCallback
│   └── CameraFeed.tsx             ← Sin cambios (ya expone videoRef)
├── utils/
│   └── gestureDetectors.ts       ← Sin cambios (lógica de clasificación independiente)
└── types.ts                       ← Sin cambios
```

## Pasos de implementación

### Paso 1 — Instalar paquetes

```bash
pnpm add @mediapipe/tasks-vision
pnpm add -D vite-plugin-static-copy
```

### Paso 2 — Configurar Vite para copiar WASM a public/

En `vite.config.ts`, agregar el plugin `viteStaticCopy` para copiar los archivos WASM desde `node_modules` a `public/mediapipe/wasm/` durante el build y dev server.

El plugin intercepta la solicitud en tiempo real (no copia física a disco durante `dev`, pero sí en `build`).

### Paso 3 — Descargar modelo Full

Se requiere el archivo `hand_landmarker.task` (Full, float16, ~15 MB).

**Origen oficial:** `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task`

**Destino:** `public/mediapipe/hand_landmarker.task`

Se puede descargar con `curl` o manualmente.

### Paso 4 — Refactorizar HandOverlay.tsx

| Cambio | Detalle |
|---|---|
| Import | `HandLandmarker`, `FilesetResolver` desde `@mediapipe/tasks-vision` |
| Props | Aceptar `videoRef` en lugar de `stream`; usar el video renderizado por `CameraFeed` |
| Init | `FilesetResolver.forVisionTasks('/mediapipe/wasm/')` |
| Modelo | `HandLandmarker.createFromOptions()` con modelo Full, GPU, confidence 0.4 |
| Bucle | `video.requestVideoFrameCallback()` en vez de `requestAnimationFrame` |
| Canvas | Calcular dimensiones una sola vez en init, no por frame |
| Cleanup | `handLandmarker.close()` al desmontar |

### Paso 5 — Limpiar index.html

Eliminar el script:

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

### Paso 6 — Limpiar package.json

Eliminar la dependencia legacy:

```bash
pnpm remove @mediapipe/hands
```

### Paso 7 — Integrar en ImmersiveExperience

Pasar el `videoRef` compartido (ya existente) a `HandOverlay`:

```tsx
<HandOverlay
  videoRef={videoRef}
  stream={camera.stream}
  onGesture={(data) => { ... }}
/>
```

`HandOverlay` usa `videoRef.current` como fuente de video y como argumento de `requestVideoFrameCallback`. Ya no crea su propio `<video>` oculto.

### Paso 8 — Verificar

```bash
pnpm run type-check   # Sin errores
pnpm run build        # Build exitoso, WASM y .task en dist/mediapipe/
```

## Mapa de cambios por archivo

| Archivo | Acción |
|---|---|
| `package.json` | ➕ `@mediapipe/tasks-vision`, ➖ `@mediapipe/hands`, ➕ `vite-plugin-static-copy` (dev) |
| `vite.config.ts` | ➕ `viteStaticCopy` para WASM |
| `index.html` | ➖ script CDN de MediaPipe Hands |
| `src/components/HandOverlay.tsx` | ♻️ Refactor completo |
| `src/components/ImmersiveExperience.tsx` | 🔧 Pasar `videoRef` a HandOverlay |
| `public/mediapipe/` | ➕ `hand_landmarker.task` |
| `public/mediapipe/wasm/` | ➕ Archivos WASM (vía Vite copy) |

## API nueva — HandOverlay refactorizado

```typescript
interface HandOverlayProps {
  stream: MediaStream | null;       // Sigue necesitándose para el hidden video fallback
  videoRef: React.RefObject<HTMLVideoElement | null>;  // Video compartido con CameraFeed
  mirrored?: boolean;
  onGesture?: (data: GestureData) => void;
}
```

### Flujo interno

1. Se monta → llama a `initHandLandmarker()`:
   - `FilesetResolver.forVisionTasks('/mediapipe/wasm/')`
   - `HandLandmarker.createFromOptions()` con configuración GPU y modelo Full
2. Espera que `videoRef.current` tenga `readyState >= 2`
3. Calcula dimensiones del canvas una vez
4. Registra el primer `requestVideoFrameCallback` en el video
5. Cada callback:
   - Ejecuta `handLandmarker.detectForVideo(video, timestamp)`
   - Dibuja landmarks en el canvas
   - Clasifica gestos y llama a `onGesture()`
   - Vuelve a registrar `requestVideoFrameCallback`
6. Se desmonta → `handLandmarker.close()`, cancela callback

### Manejo de errores

- Si `FilesetResolver` falla (WASM no encontrado): error silencioso, experiencia 3D sigue funcionando sin gestos
- Si `createFromOptions` falla: mismo comportamiento degradado
- Si `detectForVideo` lanza excepción en un frame: se captura y continúa con el siguiente frame

## Beneficios esperados

- **60 FPS estables** en dispositivos con GPU (inferencia en GPU, sin polling)
- **Sin dependencia de red** (WASM + modelo en disco local)
- **Mayor precisión** en baja luz/oclusiones (modelo Full + GPU)
- **Un solo decodificador de video** (ahorro de batería/CPU)
- **API oficial vigente** con soporte continuo de Google
