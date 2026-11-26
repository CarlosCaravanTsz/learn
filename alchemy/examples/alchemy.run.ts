import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as State from "alchemy/State";
import * as Effect from "effect/Effect";

const Notes = Cloudflare.R2.Bucket("Notes");

const Api = Cloudflare.Worker("Api", {
  main: "./worker.ts",
  env: { Notes },
});

export type WorkerEnv = Cloudflare.InferEnv<typeof Api>;

export default Alchemy.Stack(
  "AlchemyLab",
  { providers: Cloudflare.providers(), state: State.localState() },
  Effect.gen(function* () {
    const bucket = yield* Notes;
    const worker = yield* Api;

    return { bucketName: bucket.bucketName, url: worker.url };
  }),
);
