# Alchemy para desarrolladores de React y TypeScript

Alchemy v2 convierte la descripción de tu infraestructura en un plan de cambios y puede aplicarlo mediante las APIs del proveedor. En este laboratorio vas a levantar un servidor HTTP que guarda una nota y a seguir el recorrido desde la declaración en TypeScript hasta la lectura del dato.

1. [De TypeScript a infraestructura](lessons/0001-de-typescript-a-infraestructura.html)
2. [Un Worker que guarda una nota](lessons/0002-worker-y-r2.html)
3. [Leer un plan antes de desplegar](lessons/0003-estado-y-plan.html)

La [referencia rápida](reference/guia-rapida.html) reúne los conceptos y comandos. Las [fuentes oficiales](RESOURCES.md) amplían cada tema.

## Ejecutar el ejemplo local

Desde la raíz del repositorio, con Node.js 24 y npm:

```sh
cd alchemy/examples
npm ci
npm run check
npm run dev
```

Usa la URL que imprima Alchemy. La segunda lección incluye peticiones de prueba y resultados esperados. El ejemplo fija Alchemy y su proveedor Cloudflare en `2.0.0-beta.87` para que el laboratorio use la misma API en cada instalación.
