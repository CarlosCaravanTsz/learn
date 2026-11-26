import type { WorkerEnv } from "./alchemy.run.ts";

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/health" && request.method === "GET") {
      return Response.json({ ok: true });
    }

    if (pathname !== "/note") {
      return new Response("Ruta desconocida", { status: 404 });
    }

    if (request.method === "PUT") {
      await env.Notes.put("note.txt", await request.text());
      return new Response(null, { status: 204 });
    }

    if (request.method === "GET") {
      const note = await env.Notes.get("note.txt");
      return note
        ? new Response(await note.text(), {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        : new Response("Todavía no hay nota", { status: 404 });
    }

    return new Response(null, { status: 405, headers: { Allow: "GET, PUT" } });
  },
};
