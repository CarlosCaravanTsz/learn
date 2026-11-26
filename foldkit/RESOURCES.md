# Foldkit Resources

## Knowledge

- [Doc oficial: Architecture](https://foldkit.dev/core/architecture)
  El loop Model/Message/update/view, las cinco fuentes de Messages y la tabla de definiciones. Fuente primaria para cualquier lección sobre el modelo mental.
- [Doc oficial: Coming from React](https://foldkit.dev/react/coming-from-react)
  Traducción concepto a concepto desde React (useState → Model, useReducer → update, useEffect → Subscription/Command) con el mismo counter evolucionando. Crítico dado el background del usuario.
- [Doc oficial: Messages](https://foldkit.dev/core/messages)
  Semántica de Messages como hechos (no instrucciones), convenciones de nombres (`Clicked*`, `Succeeded*`, `Failed*`, `Completed*`, `Got*`) y `defineMessageUnion`.
- [Doc oficial: Commands](https://foldkit.dev/core/commands)
  Efectos one-shot como datos: `Command.define`, `args`, `messages`, interrupción (`interrupt`), HTTP con `HttpClient` y el patrón generation para resultados obsoletos.
- [Doc oficial: Get Started](https://foldkit.dev/get-started)
  `create-foldkit-app`, estructura de archivos (main.ts puro vs entry.ts runtime), requisitos (Node 22+, Effect ~4.1.0).
- [Doc oficial: Testing](https://foldkit.dev/testing)
  Story tests (state machine pura) y Scene tests (a través de la vista, con locators accesibles). Sin DOM, sin mocking, sin timers reales.
- [Doc oficial: DevTools](https://foldkit.dev/core/devtools)
  Inspección de Messages y Model en cada paso, rewind de UI, y los mismos datos vía MCP para agentes.
- [Catálogo de 36 example apps](https://foldkit.dev/example-apps)
  De counter a auth, shopping cart, WebSocket chat, SSR/SSG. Cada una con fuente en GitHub. Fuente de ejemplos y ejercicios.
- [Playground del counter](https://foldkit.dev/playground/counter)
  Ejecutable en el navegador, para ver el loop sin instalar nada.
- [Repositorio GitHub: foldkit/foldkit](https://github.com/foldkit/foldkit)
  Código fuente y changelog del paquete.
- [The Elm Architecture (guía oficial de Elm)](https://guide.elm-lang.org/architecture/)
  El patrón original que Foldkit adapta. Útil como referencia conceptual, no necesario leerlo completo.
- [Effect](https://effect.website)
  La plataforma sobre la que Foldkit está construido. Referencia para cuando el usuario profundice en Effect mismo.

## Wisdom (Communities)

- [Discord de Foldkit](https://discord.gg/kav8VNxqGm)
  Comunidad oficial, framework pre-1.0: el lugar donde resolver dudas de API y reportar behaviour raro.
- [X/Twitter: @devinjameson](https://x.com/devinjameson)
  Anuncios de releases y deep dives ocasionales del autor.
- [GitHub issues de foldkit](https://github.com/foldkit/foldkit/issues)
  Para bugs concretos y discusiones de diseño; el estado pre-1.0 hace que issues=señal sobre la madurez real.

## Gaps

- No existe (todavía) un " libro" o curso largo de Foldkit: el material canónico es la doc oficial + ejemplos. Las lecciones de este workspace llenan ese hueco para un hispanohablante viniendo de React.
- Material de Effect 4.x en español es escaso; las lecciones introducen Effect solo en la medida en que Foldkit lo usa.
