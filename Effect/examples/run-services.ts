import assert from "node:assert/strict"
import { Effect } from "effect"
import { demoSource, loadProfile } from "./02-services.js"

for (const id of ["42", "invalid", "offline"]) {
  const result = await Effect.runPromise(
    loadProfile(id).pipe(
      Effect.provide(demoSource),
      Effect.match({
        onFailure: (error) => error._tag,
        onSuccess: (profile) => profile.name,
      }),
    ),
  )
  console.log(id, "→", result)
  assert.equal(result, { "42": "Ada", invalid: "SchemaError", offline: "RequestError" }[id])
}
