# Evidencia de prueba — SivAR

## 1. TypeScript — verificación de tipos

```bash
$ pnpm run type-check
> tsc --noEmit
# Sin errores. Salida limpia.
```

## 2. Build de producción

```bash
$ pnpm run build
> tsc -b && vite build
✓ 607 modules transformed.
✓ built in 8.31s
```

Salida del build:

| Recurso | Tamaño |
|---|---|
| `index.html` | 28.17 kB |
| `index-CxRHaaSA.css` | 29.62 kB |
| `index-D5a-IdEI.js` | 1,157.94 kB (325.39 kB gzip) |

## 3. Backend — API REST

```bash
# Servidor Express en http://localhost:4000
$ curl http://localhost:4000/api/models
[{"id":"torre-maya","name":"Torre Maya de San Andrés",...}]

$ curl http://localhost:4000/api/models/torre-maya
{"id":"torre-maya","name":"Torre Maya de San Andrés",...}
```

## 4. Modelos 3D

- 3 archivos GLB en `public/3d_models/`: `torre_xd.glb`, `Salvador%20del%20mundo.glb`, `trompeta%20de%20barro.glb`
- Servidos correctamente (HTTP 200) tanto en local como en GitHub Pages
- Formato glTF 2.0 válido

## 5. Hand tracking

- CDN de MediaPipe Hands cargada desde `cdn.jsdelivr.net/npm/@mediapipe/hands`
- Callback `onResults` devuelve 21 landmarks por mano
- Hasta 2 manos detectadas simultáneamente
- Gesto de pinza (índice + pulgar) reconocido para interacción 3D

## 6. Funcionalidades verificadas manualmente

| Funcionalidad | Resultado |
|---|---|
| Landing con mapa nocturno | ✅ Visibles 6 ubicaciones con marcadores |
| Invocación de modelo | ✅ Abre experiencia inmersiva |
| Renderizado 3D | ✅ Modelo visible con luces y cámara orbital |
| Interacción por gestos | ✅ Pinza detectada |
| Captura de foto | ✅ Cuenta regresiva + flash + descarga PNG con marca de agua |
| Menú de acciones | ✅ Reinicio de posición y regreso al menú |
| Selector de cámara | ✅ Lista cuando hay 2+ cámaras |
| Panel de información | ✅ Ficha histórica con datos del sitio |
| Sonido sintetizado | ✅ Tono hover, sonido de invocación, ambiente |

---

*Nota: el proyecto no cuenta con un framework de testing automatizado. La verificación se realizó mediante type-check de TypeScript, build de Vite y pruebas manuales de cada funcionalidad.*
