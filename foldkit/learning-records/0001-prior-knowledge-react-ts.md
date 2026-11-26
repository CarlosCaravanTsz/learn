# Prior knowledge: React + TypeScript; cero práctica con Elm/Effect

El usuario tiene bases de React y TypeScript, y entiende conceptualmente qué son la Elm Architecture y Effect, pero nunca ha trabajado con ninguno de los dos en la práctica. Esto fija el punto de partida: cada concepto Foldkit debe anclarse a su equivalente React antes de introducir terminología TEA/Effect.

## Evidence
Declarado directamente en la primera sesión ("Tengo bases en react y typescript pero no con el modelo elm ni Effect, aunque entiendo de que va").

## Implications
- No hace falta enseñar JSX, componentes, ni typing básico.
- No asumir familiaridad con `Effect.gen`, `yield*`, Schema o Streams: introducir cada pieza de Effect solo cuando Foldkit la usa por primera vez, con su equivalente mental (ej. Command.execute ≈ handler async, pero como dato).
- La exhaustividad de `Message.match` y la inmutabilidad explícita (`modifyFields`) son nuevos para él: reforzar en retrieval.
