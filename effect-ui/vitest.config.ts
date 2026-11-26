import { defineConfig } from "vitest/config"

// Los ejemplos del repo corren `src/**/*.test.ts` con Vitest. `@effect/vitest`
// aporta `it.effect`, que da el scope donde viven `Story.make` y `HtmlPlay.make`.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"]
  }
})
