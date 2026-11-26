# Documentación oficial de Effect y Elm

## Effect 4

- [The Effect Type](https://effect.website/docs/v4/getting-started/the-effect-type) explica cómo leer el éxito, los fallos esperados y los requisitos.
- [Creating Effects](https://effect.website/docs/v4/getting-started/creating-effects) cubre la diferencia entre capturar un valor, diferir trabajo y adaptar una promesa.
- [Building Pipelines](https://effect.website/docs/v4/getting-started/building-pipelines) cubre la composición con `map`, `flatMap` y generadores.
- [Running Effects](https://effect.website/docs/v4/getting-started/running-effects) explica qué devuelven `runPromise` y `runPromiseExit`.
- [Services](https://effect.website/docs/v4/requirements-management/services) y [Layers](https://effect.website/docs/v4/requirements-management/layers) explican cómo declarar, construir y proveer dependencias.
- [Schema](https://effect.website/docs/v4/schema/introduction) introduce la validación en tiempo de ejecución.
- [Runtime](https://effect.website/docs/v4/runtime), [Scope](https://effect.website/docs/v4/resource-management/scope) y [Retrying](https://effect.website/docs/v4/error-management/retrying) detallan ejecución, limpieza de recursos y reintentos.

## Arquitectura de interfaz

- [The Elm Architecture](https://guide.elm-lang.org/architecture/) introduce el ciclo Model–Update–View.
- [HTTP en Elm](https://guide.elm-lang.org/effects/http) muestra cómo una petición se convierte en un mensaje al finalizar.
- [Arquitectura de Foldkit](https://foldkit.dev/core/architecture) aplica ese ciclo a una app TypeScript con Effect.
- [React useReducer](https://react.dev/reference/react/useReducer) ofrece el punto de comparación para la transición de estado. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) explica cuándo React ejecuta `useEffect`.
