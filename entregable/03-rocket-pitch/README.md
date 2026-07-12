# Rocket Pitch — SivAR

**Duración estimada:** 3 minutos

---

## El problema

El patrimonio cultural de El Salvador es rico pero inaccesible de forma interactiva. Los turistas y estudiantes no pueden visualizar ni manipular sitios arqueológicos, monumentos o piezas históricas en 3D desde sus dispositivos. Las experiencias de realidad aumentada existentes requieren apps nativas, instalación y permisos complejos.

## La solución

**SivAR** — una plataforma de realidad aumentada en el navegador, sin instalación, que permite explorar el patrimonio salvadoreño usando solo la cámara web y gestos de la mano.

## Cómo funciona

1. El usuario abre la landing y elige un sitio para invocar.
2. Con un clic, se activa la cámara y el modelo 3D aparece superpuesto al mundo real.
3. El usuario interactúa con gestos: pinza para mover y escalar, 4 dedos para foto, 3 dedos para el menú.
4. Cada modelo incluye una ficha histórica con información del sitio.

## Tecnología

React 19, Three.js, MediaPipe Hands, MapLibre GL. Todo en el navegador. Procesamiento local sin enviar datos a servidores.

## Estado actual

3 modelos funcionales: Pirámide de San Andrés, Salvador del Mundo, Trompeta de Barro. Hand tracking operativo. Captura de foto implementada. Desplegado en GitHub Pages.

## Siguientes pasos

Más modelos, soporte móvil, multilingüe, modo offline para sitios arqueológicos.
