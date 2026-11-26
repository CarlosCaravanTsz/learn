# Tareas (`exact-todo`)

Exact es el framework de Expo para armar apps en web, iOS, macOS, Android y Linux: cada plataforma pinta con lo suyo (el DOM, UIKit, AppKit o el pintor de Exact), desde una sola fuente en Contract más TypeScript.
Sigue en pre-1.0, cambia a diario y no hay paquete en npm: se usa un checkout de [github.com/expo/exact](https://github.com/expo/exact).

**Commit de Exact fijado:** `ce17cb1ebb0ce9aadd2d3875ce753a0ba5e9b027`

La app tiene dos pestañas, con las rutas de Exact (`routes` / `role="tablist"`): **Tareas** y **Clima**. Clima muestra el pronóstico de Open-Meteo para una ciudad, un código postal o un par `lat,lon`. La ciudad inicial es Puerto Vallarta. Un texto con coma y dos números no pasa por geocoding; el resto sí, con `https://geocoding-api.open-meteo.com/v1/search?name=…` (ese `name` también acepta códigos postales). El pronóstico pide el tiempo actual y cinco días, los mismos campos que el piloto de Effect UI.

## Configuración

Hace falta Rust (rustup) y Bun 1.4.2 o más nuevo. En esta máquina el setup corrió con Bun 1.4.5 y Rust 1.99.1.

```sh
git clone https://github.com/expo/exact.git
cd exact
git checkout ce17cb1ebb0ce9aadd2d3875ce753a0ba5e9b027
bun scripts/exact.mjs setup
```

`exact new` creó esta carpeta **fuera** del checkout de Exact. El lanzador `exact.mjs` (generado, no se edita) guarda una pista `const seed` que en esta máquina es `../../../../home/ubuntu/exact`, y `.exact/checkout` es un enlace simbólico al checkout (está en `.gitignore`). En otra máquina define el checkout antes de cada comando:

```sh
export EXACT=/ruta/al/checkout/de/exact
cd exact-todo
bun exact.mjs --help
```

`EXACT` gana sobre la pista. Una ruta relativa se resuelve desde esta carpeta.

`app.ts` declara `net.fetch` para `https://geocoding-api.open-meteo.com` y `https://api.open-meteo.com`. Las peticiones son GET sin headers propios (`exactTimeout` es un tope del runtime, no un header), para que el navegador no haga un preflight.

## Correr la app

Desde `exact-todo/`, con `EXACT` apuntando al checkout.

**Web.** Servidor de desarrollo en `http://127.0.0.1:8765/`:

```sh
bun exact.mjs web
```

**Linux.** Compila el host y deja el binario en `target/host-dev/exact-todo-linux`. Las pruebas y el agente lo manejan en un buffer sin pantalla. En un escritorio Wayland, ese binario abre una ventana.

En esta imagen `c++` es Clang y `rust-lld` no encuentra `libstdc++` de GCC, así que el build usó:

```sh
export CC=gcc CXX=g++
export LIBRARY_PATH=/usr/lib/gcc/x86_64-linux-gnu/13
bun exact.mjs linux
```

Si `c++` ya es `g++` y el linker ve `libstdc++`, basta `bun exact.mjs linux`.

Captura headless (420×900, el tamaño por defecto del agente). `clock data` espera la respuesta de Open-Meteo:

```sh
EXACT_APP_DIR="$PWD" bun "$EXACT/scripts/agent.mjs" linux \
  "tap tab-weather" "clock data" "screenshot linux-clima.png"
```

**macOS.** No se corrió aquí: hace falta una Mac con Xcode.

```sh
bun exact.mjs mac --run
```

**Simulador de iOS.** No se corrió aquí: hace falta una Mac con Xcode y un simulador arrancable. `EXACT_SIM` es el nombre o el UDID del simulador; déjalo definido también para `agent.mjs ios` (o pasa `--sim`).

```sh
export EXACT_SIM="iPhone 17"
bun exact.mjs ios --run
```

## Pruebas de contrato

`app.test.contract` cubre la lista (agregar, marcar, borrar, cuántas quedan) y el clima (Puerto Vallarta, un código postal, coordenadas, búsqueda vacía y lugar desconocido). La red de los tests está fingida con `answer fetch` y `fail fetch`, como dice la gramática de Exact: la petición no sale de la máquina. Un fixture inmediato ya está aplicado en el paso siguiente, así que la carga usa `after 200` y `clock +200` para alcanzar a ver «Buscando…».

`scripts/agent.mjs` no compila la app: en web hay que construir el dist antes; en Linux hay que haber corrido `bun exact.mjs linux`.

**Web** (corrido: las tres pruebas `ok`, `3 passed, 0 failed`):

```sh
export EXACT_APP_DIR=/ruta/al/repo/exact-todo
cd "$EXACT"
bun host/web/build.mjs exact-todo-web
bun scripts/agent.mjs web --test "$EXACT_APP_DIR/app.test.contract"
```

**Linux, buffer headless** (corrido: las tres pruebas `ok`, `3 passed, 0 failed`):

```sh
export EXACT_APP_DIR=/ruta/al/repo/exact-todo
cd "$EXACT"
bun scripts/agent.mjs linux --test "$EXACT_APP_DIR/app.test.contract"
```

**macOS** (no corrido):

```sh
export EXACT_APP_DIR=/ruta/al/repo/exact-todo
cd "$EXACT"
bun scripts/agent.mjs macos --test "$EXACT_APP_DIR/app.test.contract"
```

**Simulador de iOS** (no corrido). `EXACT_SIM` sigue valiendo para el agente:

```sh
export EXACT_SIM="iPhone 17"
export EXACT_APP_DIR=/ruta/al/repo/exact-todo
cd "$EXACT"
bun scripts/agent.mjs ios --test "$EXACT_APP_DIR/app.test.contract"
```

La prueba del lugar desconocido tira el error a propósito. El runner lo anota como `unarranged` (`No encontré «Atlantis».` en web; en Linux solo dice que el recurso se rechazó una vez) y la prueba igual pasa, porque la vista muestra ese texto.

## Mapa de archivos

| Archivo | Qué es |
|---|---|
| `app.contract` | Las dos vistas en Contract y las pestañas. |
| `app.ts` | La lista en memoria y el seam. Los grants de red viven aquí. |
| `weather.ts` | Geocoding, el atajo `lat,lon` y el pronóstico. Lo importa `app.ts`. |
| `app.test.contract` | Pruebas de la lista y del clima, con la red fingida. |
| `app.contract.d.ts` | Tipos del seam. Lo reescribe el build y `.gitignore` lo deja fuera. |
| `app.json` | Manifiesto. `exact new` dejó `host.web`; el primer `bun exact.mjs linux` agregó `host.linux`. |
| `exact.mjs` | Lanzador generado por `exact new`. |
| `AGENTS.md` | Notas generadas para agentes. `CLAUDE.md` es un enlace a este archivo. |
| `package.json` | El nombre del crate es `exact-todo`. |
