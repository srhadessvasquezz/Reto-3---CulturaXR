# Registro de Decisiones Técnicas

Cada decisión importante se documenta aquí con contexto, opciones consideradas y justificación.

---

## DEC-001: Usar pnpm como gestor de paquetes

- **Fecha:** 2026-07-11
- **Contexto:** Necesitamos un gestor rápido y eficiente en disco para que cada miembro del equipo instale rápido en local.
- **Opciones:** npm, yarn, pnpm
- **Decisión:** pnpm — instalación más rápida, hard links ahorran espacio, lockfile determinista.

## DEC-002: getUserMedia directo en vez de MediaPipe Camera

- **Fecha:** 2026-07-11
- **Contexto:** MediaPipe Camera Utils agrega una capa de abstracción innecesaria y peso extra.
- **Decisión:** Usar `navigator.mediaDevices.getUserMedia` + RAF loop manual. Más control sobre el ciclo de renderizado y menor bundle size.

## DEC-003: Modelos GLB en public/ (no importados vía src/)

- **Fecha:** 2026-07-11
- **Contexto:** Los modelos 3D son archivos binarios grandes que no se benefician del bundling de Vite.
- **Decisión:** Colocarlos en `public/3d_models/` y referenciarlos por ruta. Vite los copia sin procesar al build.

## DEC-004: Backend Express con registro JSON de modelos

- **Fecha:** 2026-07-11
- **Contexto:** Necesitamos una forma sencilla de agregar/quitar modelos 3D sin tocar código del frontend. El equipo de contenido no necesariamente sabe TypeScript.
- **Opciones:** Base de datos SQLite, archivo YAML, JSON estático en frontend, API serverless (Cloudflare Workers), Express + JSON
- **Decisión:** Express + JSON plano (`server/models.json`). Es la solución más simple: cero migraciones, editable con cualquier editor de texto, y el servidor se reinicia instantáneamente al cambiar el archivo. Si en el futuro se necesita persistencia o autenticación, se puede migrar a SQLite sin cambiar la interfaz de la API.

## DEC-005: Proxy de Vite en desarrollo para API

- **Fecha:** 2026-07-11
- **Contexto:** El frontend en :3000 necesita hablar con el backend en :4000 sin CORS en desarrollo.
- **Opciones:** CORS en Express, proxy de Vite, mismo puerto
- **Decisión:** Proxy de Vite (`vite.config.ts`). Es transparente para el desarrollador — las peticiones `/api/*` se redirigen automáticamente al backend. En producción habrá que ajustar según el hosting.

## DEC-006: Uso de concurrently para desarrollo integrado

- **Fecha:** 2026-07-11
- **Contexto:** Tener que abrir dos terminales para trabajar es fricción innecesaria.
- **Decisión:** `concurrently` en el script `dev` raíz levanta servidor y frontend en paralelo con una sola invocación.
