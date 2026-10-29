import { createServer } from "node:http";

import { handler } from "./dist/server/entry.mjs";

const port = Number(process.env.PORT ?? 4321);

createServer((req, res) => handler(req, res)).listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
