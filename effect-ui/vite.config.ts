import { defineConfig } from "vite"

// Misma forma que `examples/counter` del repo Effect-TS/ui: Vite sirve
// `index.html` y el entry `src/main.ts`. Sin plugin extra: el CSS se enlaza
// desde el HTML, así `tsc` no tiene que entender imports de hojas de estilo.
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  }
})
