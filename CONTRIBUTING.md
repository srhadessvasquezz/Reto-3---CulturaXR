# Guía de Contribución

## Setup Local

```bash
# 1. Clonar el repo
git clone https://github.com/TU-USUARIO/hackathon-turismo-sv.git
cd hackathon-turismo-sv

# 2. Instalar dependencias (usar pnpm)
pnpm install

# 3. Levantar dev server
pnpm dev
```

## Convención de Commits

Cada commit debe ser descriptivo y seguir este formato:

```
<tipo>(<alcance>): <título descriptivo>

<cuerpo: qué se hizo, por qué, y qué problema resuelve>

Cambios:
- <cambio 1>
- <cambio 2>
```

### Tipos permitidos

| Tipo       | Uso                                              |
| ---------- | ------------------------------------------------ |
| `feat`     | Nueva funcionalidad                              |
| `fix`      | Corrección de bug                                |
| `docs`     | Cambios en documentación                         |
| `style`    | Formato, CSS, sin cambio de lógica               |
| `refactor` | Refactorización sin cambio funcional             |
| `perf`     | Mejora de rendimiento                            |
| `chore`    | Tareas de mantenimiento (deps, config, CI)       |

### Alcances comunes

`hand-tracking`, `3d`, `physics`, `camera`, `ui`, `docs`, `ci`, `config`

### Ejemplo real

```
feat(hand-tracking): detectar gesto de pinch con MediaPipe

Implementa detección de distancia entre pulgar e índice para
reconocer el gesto de pinch. Se usa para interactuar con objetos
3D en la escena de Three.js.

Cambios:
- Nuevo hook usePinchDetection en src/hooks/
- Umbral de distancia configurable (default: 40px)
- Integración con el evento onPinch del componente Scene3D
```

## Regla de Documentación

**Obligatorio:** Todo cambio al código debe reflejarse en la documentación.

1. **Siempre** actualizá `docs/CHANGELOG.md` con una entrada del cambio.
2. Si tomás una decisión técnica (elegir librería, cambiar enfoque, descartar algo), documentala en `docs/DECISIONS.md`.
3. Si cambia la arquitectura o estructura de carpetas, actualizá `docs/ARCHITECTURE.md`.

## Flujo de Trabajo

1. Cada quien trabaja en su rama: `feat/nombre-feature` o `fix/nombre-bug`.
2. Al terminar, hacer merge a `main` (durante el hackathon trabajamos rápido, no PRs formales).
3. Antes de pushear: `pnpm build` debe pasar sin errores.
4. Comunicar al equipo qué archivos tocaste para evitar conflictos.

## Resolución de Conflictos

Si hay conflicto de merge:
1. Comunicar al equipo en el chat.
2. La persona que hizo el cambio más reciente resuelve.
3. Verificar que `pnpm build` pasa después de resolver.
