# Hackathon Turismo SV

Prototipo interactivo para el **Hackathon de Turismo Creativo I** (C3 + Poliédrica, 11-12 julio 2026).

Hand tracking + modelos 3D + física en el navegador.

## Stack

| Capa           | Tecnología                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | React 19 + Vite 6 + TypeScript 5                      |
| Hand tracking  | MediaPipe Hands (`@mediapipe/hands`)                  |
| Cámara         | `getUserMedia` + RAF loop                             |
| Renderizado 2D | Canvas 2D (esqueleto de manos)                        |
| Renderizado 3D | Three.js + react-three-fiber                          |
| Modelos 3D     | GLB en `public/3d_models/`                            |
| Física         | Gravedad, resorte, rebote de suelo, damping           |
| Despliegue     | GitHub Pages vía Actions                              |
| Paquetes       | pnpm                                                  |

## Requisitos

- **Node.js** >= 22
- **pnpm** >= 9 (`npm install -g pnpm` si no lo tenés)
- Navegador con soporte WebRTC (Chrome/Edge recomendado)
- Cámara web

## Setup Local

```bash
# 1. Clonar
git clone https://github.com/TU-USUARIO/hackathon-turismo-sv.git
cd hackathon-turismo-sv

# 2. Instalar dependencias
pnpm install

# 3. Levantar dev server (abre http://localhost:3000)
pnpm dev

# 4. Build de producción
pnpm build

# 5. Preview del build
pnpm preview
```

## Estructura del Proyecto

```
src/
├── components/    # Componentes React
├── hooks/         # Custom hooks (cámara, hand tracking, physics)
├── utils/         # Funciones utilitarias
├── assets/        # Imágenes, íconos
├── styles/        # CSS global
├── App.tsx        # Componente raíz
└── main.tsx       # Entry point

public/
└── 3d_models/     # Modelos GLB (no pasan por bundler)

docs/
├── ARCHITECTURE.md   # Arquitectura y stack
├── CHANGELOG.md      # Registro de cambios
└── DECISIONS.md      # Decisiones técnicas
```

## Flujo de Trabajo del Equipo

1. **Clonar** el repo una vez.
2. **Antes de trabajar:** `git pull origin main` para traer los últimos cambios.
3. **Crear rama** para tu feature: `git checkout -b feat/mi-feature`.
4. **Desarrollar** y probar localmente con `pnpm dev`.
5. **Commit** siguiendo la convención (ver [CONTRIBUTING.md](CONTRIBUTING.md)).
6. **Push** y merge a main.
7. **Comunicar** al equipo qué archivos tocaste.

## Comandos Útiles

| Comando            | Qué hace                         |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Dev server con hot reload        |
| `pnpm build`       | Build de producción              |
| `pnpm preview`     | Sirve el build localmente        |
| `pnpm lint`        | Corre ESLint                     |
| `pnpm type-check`  | Verifica tipos sin compilar      |

## Documentación

Todo cambio debe documentarse. Ver reglas completas en [CONTRIBUTING.md](CONTRIBUTING.md).

## Equipo

Hackathon de Turismo Creativo I — Key Institute, San Salvador.
