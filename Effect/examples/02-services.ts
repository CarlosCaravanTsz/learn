import { Context, Effect, Layer, Schema } from "effect"

const Profile = Schema.Struct({ id: Schema.String, name: Schema.String })
export type Profile = typeof Profile.Type

type RequestError = { readonly _tag: "RequestError"; readonly cause: unknown }

class ProfileSource extends Context.Service<
  ProfileSource,
  { readonly get: (id: string) => Effect.Effect<unknown, RequestError> }
>()("ProfileSource") {}

export function loadProfile(id: string) {
  return Effect.gen(function* () {
    const source = yield* ProfileSource
    const raw = yield* source.get(id)
    return yield* Schema.decodeUnknownEffect(Profile)(raw)
  })
}

export const demoSource = Layer.succeed(ProfileSource, {
  get: (id) =>
    Effect.tryPromise({
      try: (): Promise<unknown> => {
        switch (id) {
          case "offline":
            return Promise.reject(new Error("Conexión perdida"))
          case "invalid":
            return Promise.resolve({ id, name: 42 })
          default:
            return Promise.resolve({ id, name: "Ada" })
        }
      },
      catch: (cause): RequestError => ({ _tag: "RequestError", cause }),
    }),
})
