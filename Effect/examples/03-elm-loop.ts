import assert from "node:assert/strict"
import { Effect } from "effect"
import { demoSource, loadProfile, type Profile } from "./02-services.js"

type Model =
  | { readonly tag: "Idle"; readonly request: number }
  | { readonly tag: "Loading"; readonly request: number }
  | { readonly tag: "Ready"; readonly request: number; readonly profile: Profile }
  | { readonly tag: "Failed"; readonly request: number; readonly reason: string }

type Message =
  | { readonly tag: "Load"; readonly id: string }
  | { readonly tag: "Loaded"; readonly request: number; readonly profile: Profile }
  | { readonly tag: "LoadFailed"; readonly request: number; readonly reason: string }

type Command = { readonly id: string; readonly request: number }
type Transition = readonly [Model, Command?]

function update(model: Model, message: Message): Transition {
  if (message.tag === "Load") {
    const request = model.request + 1
    return [{ tag: "Loading", request }, { id: message.id, request }]
  }

  if (model.tag !== "Loading" || model.request !== message.request) {
    return [model]
  }

  return message.tag === "Loaded"
    ? [{ tag: "Ready", request: message.request, profile: message.profile }]
    : [{ tag: "Failed", request: message.request, reason: message.reason }]
}

function view(model: Model): string {
  switch (model.tag) {
    case "Idle": return "Elige un perfil"
    case "Loading": return "Cargando…"
    case "Ready": return model.profile.name
    case "Failed": return "Error: " + model.reason
  }
}

function runCommand(command: Command): Promise<Message> {
  return Effect.runPromise(
    loadProfile(command.id).pipe(
      Effect.provide(demoSource),
      Effect.match({
        onFailure: (error): Message => ({
          tag: "LoadFailed", request: command.request, reason: error._tag,
        }),
        onSuccess: (profile): Message => ({
          tag: "Loaded", request: command.request, profile,
        }),
      }),
    ),
  )
}

let model: Model = { tag: "Idle", request: 0 }
console.log(view(model))

function dispatch(message: Message): Command | undefined {
  const [next, command] = update(model, message)
  model = next
  console.log(view(model))
  return command
}

const first = dispatch({ tag: "Load", id: "offline" })
const second = dispatch({ tag: "Load", id: "42" })
assert.ok(first && second)
const [older, newer] = await Promise.all([runCommand(first), runCommand(second)])

// Entregamos a propósito la respuesta anterior mientras la última carga sigue activa.
dispatch(older)
assert.equal(view(model), "Cargando…")
dispatch(newer)
assert.equal(view(model), "Ada")

const invalid = dispatch({ tag: "Load", id: "invalid" })
assert.ok(invalid)
dispatch(await runCommand(invalid))
assert.equal(view(model), "Error: SchemaError")
