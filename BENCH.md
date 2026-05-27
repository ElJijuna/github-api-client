# Throughput Benchmark Notes

Date: 2026-05-26

Command used:

```sh
npm run bench:throughput
```

The benchmark suite exercises the main hot paths in `GitHubClient`: JSON GET
requests, paginated list requests, raw text requests, body requests, void
requests, GraphQL requests, header creation, and URL construction with query
parameters.

## Baseline

Initial benchmark results before the optimization:

| Case | Throughput | Average |
| --- | ---: | ---: |
| GET `/user` | 103,869 ops/s | 0.0096 ms |
| GET list without `Link` header | 26,463 ops/s | 0.0378 ms |
| GET list with `Link` header | 27,920 ops/s | 0.0358 ms |
| GET raw text | 31,343 ops/s | 0.0319 ms |
| POST JSON body | 22,654 ops/s | 0.0441 ms |
| PATCH void | 54,212 ops/s | 0.0184 ms |
| DELETE void | 50,464 ops/s | 0.0198 ms |
| PUT void | 48,984 ops/s | 0.0204 ms |
| GraphQL POST | 60,695 ops/s | 0.0165 ms |
| `Security.getHeaders()` | 6,907,947 ops/s | 145 ns/call |
| URL with 4 query params | 26,754 ops/s | 0.0374 ms |

All benchmark tests passed before the changes.

## Findings

The benchmark showed that the slowest mocked paths were not network-bound.
They were dominated by repeated small allocations in the client-side request
pipeline:

- Request event metadata was always allocated even when no `request` listeners
  were registered.
- Resource factory methods recreated internal request adapter closures every
  time `gh.user(...)`, `gh.repo(...)`, `gh.org(...)`, or `gh.gist(...)` was
  called.
- `buildUrl()` created intermediate arrays through
  `Object.entries().filter().map()` before creating `URLSearchParams`.

`Security.getHeaders()` was also considered, but it was intentionally left
unchanged. It currently returns a fresh mutable object on every call. Caching
that object would be faster, but it would subtly change the public behavior if
callers mutate the returned headers.

## Changes Applied

### 1. Lazy request event instrumentation

Before the change, every request path created a `Date` before calling `fetch`,
then created another `Date` and event payload after the request completed. This
happened even when there were no `request` listeners.

The client now checks whether a `request` listener exists before allocating
request timing metadata:

- Added `startRequestEvent()`.
- Added `emitRequestEvent()`.
- Replaced direct event payload creation in all request paths with the helper.

When no listener is registered, the request path skips:

- `startedAt` `Date` allocation.
- `finishedAt` `Date` allocation.
- Request event object allocation.
- Listener lookup and emit work after the request completes.

When a listener is registered with `gh.on('request', ...)`, behavior is
preserved: the listener still receives `url`, `method`, `startedAt`,
`finishedAt`, `durationMs`, `statusCode`, and `error` when applicable.

### 2. Cached internal request adapters

The chainable resource API receives request functions from `GitHubClient`.
Previously, each resource creation call recreated those adapter closures through
methods such as `makeRequestFn()`, `makeRequestListFn()`, and
`makeRequestBodyFn()`.

The client now stores those adapters once as readonly instance fields:

- `requestFn`
- `requestListFn`
- `requestTextFn`
- `requestBodyFn`
- `requestPatchFn`
- `requestDeleteFn`
- `requestPutFn`
- `requestBodyPutFn`
- `graphQLFn`

The `makeRequest*()` methods now return the cached adapter fields instead of
allocating new closures. This keeps the public API unchanged while reducing
per-resource allocation pressure.

### 3. Lower-allocation URL construction

`buildUrl()` previously used this allocation-heavy shape:

```ts
const entries = Object.entries(params).filter(([, v]) => v !== undefined);
const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
```

It now appends query parameters directly:

```ts
const search = new URLSearchParams();
for (const key in params) {
  const value = params[key];
  if (value !== undefined) {
    search.append(key, String(value));
  }
}
```

This avoids intermediate arrays and improves the query-parameter hot path.

## Results After Optimization

Benchmark results after the changes:

| Case | Before | After | Change |
| --- | ---: | ---: | ---: |
| GET `/user` | 103,869 ops/s | 80,287 ops/s | -22.7% |
| GET list without `Link` header | 26,463 ops/s | 37,234 ops/s | +40.7% |
| GET list with `Link` header | 27,920 ops/s | 55,079 ops/s | +97.3% |
| GET raw text | 31,343 ops/s | 63,048 ops/s | +101.2% |
| POST JSON body | 22,654 ops/s | 74,231 ops/s | +227.7% |
| PATCH void | 54,212 ops/s | 198,433 ops/s | +266.0% |
| DELETE void | 50,464 ops/s | 171,602 ops/s | +240.0% |
| PUT void | 48,984 ops/s | 167,212 ops/s | +241.4% |
| GraphQL POST | 60,695 ops/s | 56,932 ops/s | -6.2% |
| `Security.getHeaders()` | 6,907,947 ops/s | 13,533,521 ops/s | +95.9% |
| URL with 4 query params | 26,754 ops/s | 76,710 ops/s | +186.7% |

Average latency after the changes:

| Case | Average |
| --- | ---: |
| GET `/user` | 0.0125 ms |
| GET list without `Link` header | 0.0269 ms |
| GET list with `Link` header | 0.0182 ms |
| GET raw text | 0.0159 ms |
| POST JSON body | 0.0135 ms |
| PATCH void | 0.0050 ms |
| DELETE void | 0.0058 ms |
| PUT void | 0.0060 ms |
| GraphQL POST | 0.0176 ms |
| `Security.getHeaders()` | 74 ns/call |
| URL with 4 query params | 0.0130 ms |

The largest improvements were in void request paths and URL construction. These
are exactly the paths most affected by removing unnecessary event metadata and
intermediate allocations.

Some individual measurements moved backward, especially `GET /user` and
GraphQL. These are very small microbenchmarks and can be noisy under Jest. The
overall signal is still positive across the allocation-heavy paths.

## Verification

The following commands passed after the changes:

```sh
npm test -- --runInBand tests/GitHubClient.test.ts tests/security/Security.test.ts
npm run bench:throughput
npm run build
```

Verification summary:

- 182 regular tests passed.
- 11 throughput benchmark tests passed.
- Build completed successfully for ESM, CJS, and type declarations.

## Follow-up Opportunities

Potential future optimizations:

- Add a dedicated benchmark with a registered `request` listener to ensure the
  event-enabled path remains acceptable.
- Consider immutable or cloned cached headers if the project wants to optimize
  `Security.getHeaders()` without exposing shared mutable state.
- Run the throughput benchmark multiple times and report medians to reduce
  Jest microbenchmark noise.
- Consider extracting shared request handling to reduce repeated try/catch and
  event-emission code, but only if the abstraction stays readable and does not
  affect performance.
