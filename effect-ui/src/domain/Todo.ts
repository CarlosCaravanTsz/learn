/**
 * domain/Todo.ts — el dato, descrito con Schema.
 *
 * En Effect UI el Model no es un `interface` suelto: es un Schema. El runtime
 * lo usa para registrar el Message log, hidratar y comprobar que lo que
 * guardas es lo que luego lees. `Todo` es una fila. No sabe nada de la vista.
 */
import { Schema } from "effect"

export const Todo = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  completed: Schema.Boolean
})
export type Todo = typeof Todo.Type

/** El siguiente id es uno más que el mayor id numérico ya guardado. */
export const nextIdFrom = (todos: ReadonlyArray<Todo>): number => {
  let max = 0
  for (const todo of todos) {
    const id = Number(todo.id)
    if (Number.isInteger(id) && id > max) {
      max = id
    }
  }
  return max + 1
}
