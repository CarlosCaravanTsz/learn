# Effect desde React y TypeScript

Empieza con una función que imprime «Hola». Luego sigue un perfil desde el dato que llega hasta el nombre que aparece en pantalla.

## Lecciones

| Lección | Qué vas a practicar | Ejemplo |
| --- | --- | --- |
| [1. Cuándo se ejecuta un Effect](lessons/0001-describir-y-ejecutar.html) | Predecir qué se imprime antes y después de llamar a `runPromise`. | `npm run basics` |
| [2. Comprobar el perfil que llegó](lessons/0002-servicios-y-schema.html) | Comprobar qué pasa si el dato trae un número donde esperas un nombre. | `npm run services` |
| [3. Del clic al nombre en pantalla](lessons/0003-elm-y-effect.html) | Seguir los dos mensajes que llevan la pantalla de «Cargando…» al resultado. | `npm run elm` |

Abre los HTML en orden. Cada lección tiene una práctica corta y una respuesta que puedes desplegar después de hacer tu predicción.

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
