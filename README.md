# astro-invalid-url-encoding

A request path with a percent-escape that isn't valid UTF-8 (`/%C0/`) logs `[ERROR] Error: Invalid URL encoding` and is then routed with the undecoded path, instead of being rejected with a `400` like an over-encoded path is.

The app uses `@astrojs/node` in **middleware** mode behind a plain `node:http` server (`server.mjs`). Standalone mode has its own `decodeURI` → `400` guard in front of Astro, which hides the bug. Adapters without that guard (e.g. `@astrojs/cloudflare`) hit it in production.

## Steps

```sh
npm install
npm run build
PORT=4321 npm start
```

In another terminal:

```sh
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:4321/%C0/'
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:4321/%2525252525252525252525/'
```

## Expected

Both requests are rejected with `400`, and nothing is logged at error level.

## Actual

```
200
400
```

The server logs, for the first request:

```
[ERROR] Error: Invalid URL encoding
```

`/%C0/` is matched by `src/pages/[slug].astro` and rendered with `slug` = `%C0`. Without a matching dynamic route it renders the 404 page instead. The over-encoded path gets a clean `400`.

## Source

The error is caught and logged in `#normalizePathname`, [`packages/astro/src/core/fetch/fetch-state.ts#L1096-L1110`](https://github.com/withastro/astro/blob/883e672fd0beb575b14776bc842bdee84433e6af/packages/astro/src/core/fetch/fetch-state.ts#L1096-L1110). Only `MultiLevelEncodingError` sets `invalidEncoding` (the `400`); any other decode error is logged and the raw path carries on.
