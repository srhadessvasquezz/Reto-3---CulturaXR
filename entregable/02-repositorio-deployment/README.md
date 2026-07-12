# Repositorio técnico y Deployment público — SivAR

## Repositorio

- **URL:** [https://github.com/srhadessvasquezz/Reto-3---CulturaXR](https://github.com/srhadessvasquezz/Reto-3---CulturaXR)
- **Rama principal:** `main`
- **Flujo de trabajo:** ramas por feature → PR → merge → verificar build

## Deployment

- **Plataforma:** GitHub Pages
- **URL:** [https://srhadessvasquezz.github.io/Reto-3---CulturaXR/](https://srhadessvasquezz.github.io/Reto-3---CulturaXR/)
- **Configuración:** Vite con `base: './'` para rutas relativas compatibles con Pages
- **Build:** `pnpm run build` → carpeta `dist/` servida desde GitHub Pages

## Backend (local, no desplegado)

El servidor Express (`server/`) con la API de modelos se ejecuta localmente:

```bash
cd server
npm install
npm start
# API en http://localhost:4000
# GET /api/models
# GET /api/models/:id
# GET /3d_models/:archivo
```

## Estructura del repositorio

```
public/3d_models/    Archivos GLB de los modelos 3D
src/
  components/        Componentes React (visor 3D, hand tracking, cámara, etc.)
  hooks/             Custom hooks (useCamera, useModels)
  utils/             Utilidades (captura de foto, detectores de gestos)
  data/              Catálogo de modelos e información histórica
  styles/            Estilos CSS globales
server/              Backend Express con registro JSON de modelos
docs/                Documentación técnica y legal
img/                 Imágenes de la landing
entregable/          Carpeta de entrega final para la hackathon
```
