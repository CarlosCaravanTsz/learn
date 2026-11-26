# Mission: Effect UI

## Why
Carlos arma una fábrica de software para PyMEs (web, punto de venta, CRM) y está eligiendo el frontend. Quiere saber usar Effect UI —vista previa, snapshot `87a704b`— y decidir si una pantalla de esa fábrica puede vivir como un Component con estado explícito y efectos probables, al lado de Effect en el backend. Esta misión está inferida a partir de ese contexto; corrígela si el resultado que buscas es otro.

## Success looks like
- Explicar una pantalla del piloto (tareas o clima) como Model, Message, `update` y `view`, señalando el archivo.
- Agregar un Message y su prueba Story sin adivinar el runtime.
- Decir, con un motivo concreto de la fábrica, si Effect UI cabe en esa pantalla o si conviene seguir evaluando otro stack.

## Constraints
- TypeScript sólido. Ya evalúa TanStack y el AI SDK de Vercel; Effect UI entra a esa comparación, no la reemplaza sola.
- Lecciones cortas, en español de México, con los nombres de la API en inglés.
- El paquete no está en npm: el piloto fija el snapshot `87a704b` (`87a704bef41b40de8fa7bced97cae5d69c4233a0`).

## Out of scope
- Reescribir la fábrica, ni un POS o un CRM enteros.
- Una comparación completa contra TanStack o el AI SDK de Vercel.
- Foldkit 0.x, OpenTUI y el servidor de Effect UI, salvo lo que una lección necesite para no mentir.
