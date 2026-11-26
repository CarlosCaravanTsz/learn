import assert from "node:assert/strict"
import { Effect } from "effect"

type InvalidQuantity = { readonly _tag: "InvalidQuantity"; readonly input: string }

function parseQuantity(input: string): Effect.Effect<number, InvalidQuantity> {
  const quantity = Number(input)
  return Number.isSafeInteger(quantity) && quantity > 0
    ? Effect.succeed(quantity)
    : Effect.fail({ _tag: "InvalidQuantity", input })
}

function total(input: string) {
  return Effect.gen(function* () {
    const quantity = yield* parseQuantity(input)
    yield* Effect.sync(() => console.log("Cantidad aceptada:", quantity))
    return quantity * 25
  })
}

const program = total("2")
console.log("Programa construido")
assert.equal(await Effect.runPromise(program), 50)

const invalid = await Effect.runPromise(
  total("dos").pipe(
    Effect.match({
      onFailure: (error) => error._tag,
      onSuccess: (amount) => amount,
    }),
  ),
)
assert.equal(invalid, "InvalidQuantity")
console.log("Entrada inválida:", invalid)
