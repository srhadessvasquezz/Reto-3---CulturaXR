# Resumen Ejecutivo — SivAR

## Nombre del proyecto

**SivAR** (El Salvador en Realidad Aumentada) — Plataforma de realidad aumentada para el patrimonio cultural de El Salvador.

## Reto seleccionado

**Reto 3: CulturaXR** — Transformar la experiencia cultural y turística a través de tecnología interactiva, permitiendo a visitantes y turistas explorar sitios arqueológicos, monumentos y piezas históricas de El Salvador mediante realidad aumentada en el navegador.

## Problema que resuelve

El patrimonio cultural salvadoreño (sitios arqueológicos mayas, monumentos nacionales, piezas precolombinas) es rico pero poco accesible de forma interactiva. Los turistas y estudiantes no pueden visualizar ni manipular estos bienes culturales en 3D desde su hogar, escuela o antes de visitar los sitios. Las experiencias de realidad aumentada existentes requieren apps nativas, instalación y permisos complejos.

SivAR resuelve esto ofreciendo una experiencia de RA directamente en el navegador, sin instalación, activable desde cualquier dispositivo con cámara web.

## Usuario o beneficiario principal

- **Turistas nacionales e internacionales** que desean explorar el patrimonio cultural salvadoreño de forma inmersiva antes, durante o después de su visita.
- **Estudiantes e investigadores** que necesitan interactuar con modelos 3D de sitios arqueológicos y piezas históricas.
- **Museos y sitios arqueológicos** que pueden ofrecer una experiencia digital complementaria a la visita presencial.
- **Organizadores del reto CulturaXR** como demostración de un prototipo funcional de turismo creativo.

## Propuesta de valor en una frase

*SivAR acerca el patrimonio de El Salvador a cualquier persona con un navegador y una cámara, combinando realidad aumentada, detección de gestos y modelos 3D en una experiencia inmersiva sin instalación.*

## Funcionalidades principales construidas

| Funcionalidad | Descripción |
|---|---|
| **Landing interactiva** | Página principal con ambientación nocturna, luciérnagas animadas, niebla, mapa interactivo con 6 ubicaciones, galería de sitios y motor de sonido sintetizado. |
| **Catálogo de modelos 3D** | 3 sitios invocables: Pirámide de San Andrés, Salvador del Mundo y Trompeta de Barro. Cada uno con tarjeta, icono, categoría e información histórica. |
| **Experiencia inmersiva** | Al invocar un modelo se activa la cámara, el hand tracking y el visor 3D. El usuario ve su mano en un overlay y puede rotar, escalar y mover el modelo con gestos de pinza. |
| **Hand tracking** | Detección de hasta 2 manos con 21 landmarks cada una, dibujados en un canvas con conexiones entre puntos y código de colores. Gesto de pinza detectado para interacción. |
| **Selector de cámara** | Cuando hay 2 o más cámaras disponibles, permite elegir cuál usar. La selección se persiste en almacenamiento local. |
| **Captura de foto** | Sostener 4 dedos de forma continua inicia cuenta regresiva, flash y composición de video más canvas 3D más marca de agua, con descarga del PNG. |
| **Menú de acciones** | Botón y gesto de 3 dedos abren menú flotante con reinicio de posición y regreso al menú principal. |
| **Backend configurable** | Servidor Express con registro JSON de modelos. Para agregar un modelo solo se edita el JSON con identificador, nombre, descripción, archivo y categoría. API REST para listar y consultar modelos. |
| **Panel de información** | Cada modelo tiene ficha histórica con párrafos descriptivos, ubicación y datos de acceso, consultable durante la experiencia. |

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Framework frontend | React 19 + Vite 6 + TypeScript 5 |
| Renderizado 3D | Three.js + React Three Fiber + Drei |
| Hand tracking | MediaPipe Hands |
| Cámara | getUserMedia + enumerateDevices |
| Backend | Node.js + Express con registro JSON de modelos |
| Mapa | MapLibre GL JS |
| Sonido | Web Audio API |
| Despliegue | GitHub Pages + Actions |
| Paquetes | pnpm, npm |

## Estado de la solución

**Funcional.** El prototipo está completo y operativo. La landing se despliega en GitHub Pages, los modelos 3D se cargan y renderizan correctamente, el hand tracking detecta manos y gestos en tiempo real, la captura de foto compone y descarga el PNG con marca de agua, y el backend Express sirve la API de modelos.

## Evidencia de prueba interna realizada

- **TypeScript:** verificación de tipos sin errores.
- **Build de Vite:** todos los módulos transformados sin advertencias críticas.
- **Backend:** servidor Express inicia correctamente y los endpoints devuelven JSON válido.
- **Modelos 3D:** archivos GLB servidos sin error tanto en local como en GitHub Pages.
- **Hand tracking:** la CDN de MediaPipe Hands se carga correctamente y el callback de resultados devuelve landmarks.
- **Colaboración:** los PRs se revisaron y mergearon sin romper el build existente.

## Colaboración realizada con otro equipo

El proyecto se desarrolló en el repositorio compartido con múltiples contribuyentes mediante ramas por feature y flujo de PRs:

| Contribuyente | Aportación principal |
|---|---|
| Diego Fuentes | Experiencia inmersiva, captura de foto, menú de acciones, marco visual, detección de gestos avanzada |
| Harold Torres | Landing con diseño nocturno, mapa, galería, corrección de rutas en producción |
| Jefersson Vasquez | Lógica de cámara inicial, documentación, networking |
| Alexander Olmedo | Gestión de merges, Hand tracking, cámara, backend Express, modelo 3D, centrado de modelos, documentación |


## Próximos pasos recomendados

1. Agregar más modelos 3D para ampliar el catálogo con más sitios arqueológicos y piezas culturales.
2. Configurar despliegue continuo para deploy automático a GitHub Pages desde la rama principal.
3. Optimizar la experiencia táctil y el rendimiento en dispositivos móviles.
4. Implementar gravedad, colisiones y damping para una manipulación más realista de los modelos.
5. Extender la captura de foto a grabación de video corto compartible.
6. Agregar soporte multilingüe para turistas internacionales.
7. Cachear modelos GLB y la detección de MediaPipe para funcionar sin conexión en sitios con cobertura limitada.
8. Migrar el backend de JSON plano a una base de datos cuando el catálogo supere los 20 modelos.
9. Agregar tests automatizados para asegurar regresión cero en cada PR.
