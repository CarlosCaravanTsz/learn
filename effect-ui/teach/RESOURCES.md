# Effect UI Resources

## Knowledge

- [Artículo: Introducing Effect UI](https://ui.effect.website/article.md)
  Fuente primaria de la vista previa (26 nov 2026). Úsala para: anatomía del Component, Command, Subscription, `Component.provide`, `Component.lazy`, Story, Scene y Play.
- [Guía generada del repo, commit `87a704b`](https://github.com/Effect-TS/ui/blob/87a704bef41b40de8fa7bced97cae5d69c4233a0/ai-docs/src/10_ui/index.md)
  El mismo snapshot que el piloto. Úsala para: nombres de Messages, `mode` de un Command, y qué va en el Model.
- [Ejemplos del snapshot](https://github.com/Effect-TS/ui/tree/87a704bef41b40de8fa7bced97cae5d69c4233a0/examples)
  Apps que compilan. `counter` para el esqueleto, `file-preview` para `mode: "switch"`, `auth` para un service sobre `KeyValueStore`.
- [Effect v4: services](https://effect.website/docs/v4/requirements-management/services)
  Úsala para: `Context.Service`, el contrato que `TodoStore` y `WeatherApi` copian.
- [Effect v4: layers](https://effect.website/docs/v4/requirements-management/layers)
  Úsala para: quién provee `FetchHttpClient` y `KeyValueStore` en `src/main.ts`.
- [Effect v4: Schema](https://effect.website/docs/v4/schema/getting-started)
  Úsala para: por qué el Model es un `Schema.Struct` y no una interface.
- [Piloto en este repo](../README.md)
  El código que las lecciones citan. Úsalo para: ver el concepto ya escrito, no para reaprenderlo de memoria.

## Wisdom (Communities)

- [Discord de Effect](https://discord.gg/effect-ts)
  El enlace que publican el README de Effect-TS/effect y effect.website. Úsalo para: preguntar si una pantalla de la fábrica cabe en la vista previa, y oír a quien ya lo corre.
- [Hub de comunidad](https://effect.website/community-hub)
  Meetups y el mismo Discord, en el sitio oficial. Úsalo para: pasar de la lección a gente que construye con Effect.
- [Issues de Effect-TS/ui](https://github.com/Effect-TS/ui/issues)
  El artículo manda el desarrollo aquí. Úsalo para: un bug o un hueco del snapshot, no para una duda de estilo.

## Gaps

- effect.website/docs/v4 no tiene una guía de Effect UI. El índice de guías, revisado el 26 nov 2026, no la lista. La fuente es el artículo y el repo.
- No hay un Discord aparte para UI. El de Effect es el canal que el proyecto publica.
- Effect-TS/effect no tiene GitHub Discussions (la ruta responde 404). Para hablar, Discord; para el código de UI, issues del repo `ui`.
