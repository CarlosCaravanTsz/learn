// app.ts owns the todo list and answers Contract. Weather lives in weather.ts.
import type { Answer, Sources } from './app.contract.d.ts';
import { loadWeather } from './weather.ts';

export const grants = [
  'net.fetch https://geocoding-api.open-meteo.com',
  'net.fetch https://api.open-meteo.com',
].join('\n');

type Todo = { id: string; title: string; done: boolean };
let todos: Todo[] = [];
let next = 1;

const sources: Sources = {
  todos: () => todos,
  addTodo: ([title]) => {
    todos = [...todos, { id: String(next++), title, done: false }];
    return { count: todos.length };
  },
  setDone: ([id, done]) => {
    todos = todos.map((t) => (t.id === id ? { ...t, done } : t));
    return { count: todos.length };
  },
  removeTodo: ([id]) => {
    todos = todos.filter((t) => t.id !== id);
    return { count: todos.length };
  },
  loadWeather: ([query]) => loadWeather(query),
};

export const answer: Answer = (source, args, store, storage, native) =>
  sources[source](args, store, storage, native);
