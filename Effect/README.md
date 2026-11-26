# Effect desde React y TypeScript

Effect convierte una operación en un valor que puedes componer antes de ejecutarlo. Su tipo dice qué devuelve, qué fallos esperados puede producir y qué servicios necesita. La arquitectura Elm organiza cómo cambia el estado de una interfaz. Foldkit aplica ese patrón en TypeScript y usa Effect para ejecutar trabajo externo.

## Lecciones

| Lección | Qué vas a poder hacer | Ejemplo |
| --- | --- | --- |
| [1. Construir y ejecutar un Effect](lessons/0001-describir-y-ejecutar.html) | Leer `Effect<A, E, R>` y seguir la ejecución de `yield*`. | `npm run basics` |
| [2. Cargar datos con servicios y Schema](lessons/0002-servicios-y-schema.html) | Cambiar el origen de datos y distinguir un fallo de acceso de un dato inválido. | `npm run services` |
| [3. Conectar Effect con el ciclo de Elm](lessons/0003-elm-y-effect.html) | Convertir el resultado de un Command en un mensaje y evitar que una respuesta vieja altere el estado. | `npm run elm` |

Abre los HTML en el navegador. Cada lección propone un cambio en el ejemplo y muestra cómo comprobar el resultado.

## Ejecutar los ejemplos

Desde la raíz del repo, con Node.js 24 y npm:

```sh
cd Effect
npm ci
npm run check
npm run basics
npm run services
npm run elm
```

Los ejemplos fijan Effect **4.1.6**. Después de instalar las dependencias, se ejecutan localmente con datos simulados. El tercer ejemplo implementa el ciclo en TypeScript para que puedas seguirlo de principio a fin. El siguiente paso del curso está en la [lección de Foldkit](../foldkit/lessons/0001-el-loop-foldkit.html).

[Referencia rápida](reference/effect-y-elm.html) · [Documentación oficial consultada](RESOURCES.md) · [Misión](MISSION.md)
