// Igual que `vitest.setup.ts` del repo Effect-TS/ui: enseña a Vitest a
// comparar valores de Effect (Option, Either, Schema) por estructura.
import { addEqualityTesters } from "@effect/vitest"

addEqualityTesters()
