# Demo funcional — SivAR

## URL de la demo desplegada

[https://srhadessvasquezz.github.io/Reto-3---CulturaXR/](https://srhadessvasquezz.github.io/Reto-3---CulturaXR/)

## Cómo probar la demo

1. Abrir la URL en un navegador moderno (Chrome o Edge recomendados).
2. La landing muestra el catálogo de 3 invocaciones disponibles.
3. Hacer clic en **"Invocar"** en cualquiera de las tarjetas activas.
4. Permitir el acceso a la cámara cuando el navegador lo solicite.
5. La experiencia inmersiva se activa: se ve la cámara + el modelo 3D superpuesto.
6. Usar **gesto de pinza** (índice + pulgar juntos) para interactuar con el modelo.
7. Usar **4 dedos extendidos ~2.25s** para capturar una foto.
8. Usar **3 dedos** para abrir el menú de acciones.

## Stack técnico de la demo

- React 19 + Vite 6 + TypeScript 5
- Three.js + React Three Fiber (renderizado 3D)
- MediaPipe Hands (detección de gestos)
- MapLibre GL (mapa interactivo)
- Web Audio API (sonido sintetizado)
- GitHub Pages (hosting estático)

## Requisitos del dispositivo

- Cámara web integrada o externa.
- Navegador actualizado (Chrome, Edge, Firefox, Safari).
- Conexión a internet para la carga inicial de modelos y bibliotecas.
