# Arquitectura del Proyecto

## Stack Tecnológico

| Capa                | Tecnología                                                  |
| ------------------- | ----------------------------------------------------------- |
| Framework Frontend  | React 19 + Vite 6 + TypeScript 5                            |
| Hand tracking       | MediaPipe Hands vía CDN (`@mediapipe/hands`)                |
| Cámara              | `getUserMedia` directo + RAF loop (sin MediaPipe Camera)    |
| Renderizado 2D      | Canvas 2D (esqueleto de manos)                              |
| Renderizado 3D      | Three.js / React Three Fiber (modelos GLB)                  |
| Modelos 3D          | GLB en `public/3d_models/`, servidos por el backend         |
| Física              | Gravedad, resorte, rebote de suelo, damping                 |
| Backend API         | Node.js + Express (servidor de modelos configurable)        |
| Config. de modelos  | JSON en `server/models.json` (fácilmente extensible)        |
| Proxy dev           | Vite proxy `/api` → backend en `localhost:4000`             |
| Despliegue          | GitHub Pages vía Actions (frontend estático)                |
| Paquetes            | pnpm (raíz), npm (server)                                   |

## Estructura de Carpetas

```
hackathon-turismo-sv/
├── public/
│   └── 3d_models/          # Modelos GLB (servidos por Express)
├── server/                  # ★ Backend — API de modelos
│   ├── index.js             #   Express: rutas /api/models + /3d_models
│   ├── models.json          #   ★ Registro de modelos (editable)
│   └── package.json         #   Dependencias (express, cors)
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   ├── ModelCard.tsx    #   Targeta individual de modelo
│   │   ├── ModelList.tsx    #   Lista/grid de modelos
│   │   └── ModelViewer.tsx  #   Visor 3D con Three.js / R3F
│   ├── hooks/               # Custom hooks
│   │   └── useModels.ts     #   Fetch de modelos desde API
│   ├── utils/               # Funciones utilitarias puras
│   ├── assets/              # Imágenes, íconos, fuentes
│   ├── styles/              # CSS / estilos globales
│   │   └── global.css
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Entry point
├── docs/                    # Documentación
│   ├── ARCHITECTURE.md      # Este archivo
│   ├── CHANGELOG.md
│   └── DECISIONS.md
├── .github/workflows/
│   └── deploy.yml
├── package.json             # Scripts raíz (dev con concurrently)
├── vite.config.ts           # Proxy /api → backend
└── README.md
```

## Flujo de Datos

```
── Desarrollo ──────────────────────────────────────────────

  Cliente (Vite :3000)          Servidor (Express :4000)
  ┌─────────────────┐          ┌──────────────────────┐
  │  useModels       │──────→  │  GET /api/models      │
  │  (fetch /api/…)  │←──────  │  ← models.json        │
  └─────────────────┘          └──────────────────────┘
         │                              │
         ↓                              ↓
  ┌─────────────────┐          ┌──────────────────────┐
  │ ModelList        │          │  GET /3d_models/*.glb│
  │ ModelViewer (R3F)│←──────  │  (static files)       │
  └─────────────────┘          └──────────────────────┘

── Producción (GitHub Pages) ───────────────────────────────

  [no backend] → el build de Vite incluye el listado quemado
  o se sirve desde un hosting que provea los archivos GLB.
```

## Configuración de Modelos (`server/models.json`)

El backend lee `server/models.json` en cada inicio. Para agregar, quitar o modificar modelos solo hay que editar este archivo:

```json
[
  {
    "id": "piramide",
    "name": "Pirámide de San Andrés",
    "description": "Sitio arqueológico maya en el valle de Zapotitán.",
    "file": "/3d_models/piramide.glb",
    "category": "arqueología",
    "thumbnail": ""
  }
]
```

| Campo        | Descripción                                         |
| ------------ | --------------------------------------------------- |
| `id`         | Identificador único (usado en rutas y selección)    |
| `name`       | Nombre visible del modelo                           |
| `description`| Descripción textual                                 |
| `file`       | Ruta al archivo GLB (desde raíz del servidor)       |
| `category`   | Categoría para agrupar y colorear                   |
| `thumbnail`  | URL de imagen miniatura (opcional, `""` = automático)|

**No requiere reinicio del frontend** — solo reiniciar el servidor (`npm run dev:server`).

## API del Backend

### `GET /api/models`
Devuelve la lista completa de modelos (sin el campo `file`).

```json
[
  {
    "id": "piramide",
    "name": "Pirámide de San Andrés",
    "description": "…",
    "category": "arqueología",
    "thumbnail": null
  }
]
```

### `GET /api/models/:id`
Devuelve un modelo individual con todos sus campos, incluyendo `file`.

```json
{
  "id": "piramide",
  "name": "Pirámide de San Andrés",
  "description": "…",
  "file": "/3d_models/piramide.glb",
  "category": "arqueología",
  "thumbnail": null
}
```

### `GET /3d_models/{archivo}`
Sirve archivos GLB estáticos desde `public/3d_models/`.

## Cómo Iniciar

```bash
# 1. Instalar dependencias
pnpm install
cd server && npm install && cd ..

# 2. Iniciar backend + frontend juntos
pnpm dev

# O por separado:
pnpm dev:server   # Express en :4000
pnpm dev:client   # Vite en  :3000
```

## Regla de Documentación

**Todo cambio al código debe documentarse.** Si modificás un componente, hook, servidor o configuración:

1. Actualizá `docs/CHANGELOG.md` con la entrada correspondiente.
2. Si es una decisión de diseño o cambio arquitectónico, agregá una entrada en `docs/DECISIONS.md`.
3. Si cambia la estructura de carpetas o se agrega una capa nueva, actualizá este archivo.
