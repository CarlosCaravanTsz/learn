# Mission: Foldkit — frontend para un backend Effect

## Why
Construir el frontend de una aplicación cuyo backend usa (o usará) Effect, aprovechando que Foldkit lleva los mismos patrones (Schema, servicios, Effect) al navegador. Vengo de React + TypeScript y quiero que las decisiones de estado y efectos sean explícitas y trazables en lugar de repartidas en hooks.

## Success looks like
- Explicar el loop Model → Message → update → view (más Commands) sin ayuda y trazar cómo llega la app a cualquier estado.
- Tener una SPA Foldkit corriendo (`npx create-foldkit-app@latest`) y usar DevTools para inspeccionar el historial de Messages.
- Implementar una pantalla que consuma una API del backend Effect vía un Command (fetch → Message `Succeeded*`/`Failed*` → Model).
- Escribir Story tests del update sin runtime ni mocking.

## Constraints
- Base previa: React y TypeScript. Sin experiencia práctica con Elm Architecture ni con Effect, aunque entiende la idea general de ambos.
- Preferencia declarada: teoría primero, código después.
- Foldkit es pre-1.0 (v0.171.0) y requiere Effect ~4.1.0: los ejercicios parten de `create-foldkit-app`, no de integración manual.
- Idioma: lecciones en español, con términos técnicos y nombres de API en inglés (como aparecen en la doc oficial).

## Out of scope (por ahora)
- El lenguaje Elm y su compilador.
- Effect profundo a nivel backend (RpcClient, layers de servidor, streams avanzados) — solo lo que el frontend Foldkit necesita.
- Migración de una codebase React existente a Foldkit (si surge, sería con `Runtime.embed`, pero no es el objetivo).
