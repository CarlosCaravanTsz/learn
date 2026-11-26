# Misión de Effect

## Por qué

Entender cómo llega un resultado externo a la interfaz de Foldkit y poder conectar esa interfaz a un backend con Effect. La misión existente de [Foldkit](../foldkit/MISSION.md) da el contexto del proyecto.

## Cómo comprobar el avance

- Leer los tres parámetros de `Effect<A, E, R>` y señalar dónde comienza la ejecución.
- Cambiar la implementación de un servicio y validar la respuesta en tiempo de ejecución.
- Trazar un clic hasta el nuevo estado de la pantalla y comprobar qué pasa si llega una respuesta anterior.

## Punto de partida

Base en React y TypeScript. Teoría primero, después código y ejercicios. Las prácticas usan TypeScript y se concentran en el patrón Elm y las APIs de Effect útiles para el frontend.
