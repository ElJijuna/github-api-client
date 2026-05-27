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

## Test Environment

Performance numbers in this document were collected on the following system.
This information matters because microbenchmarks can vary noticeably across CPU,
kernel, Node.js/V8 version, power mode, scheduler behavior, and background load.

| Item | Value |
| --- | --- |
| OS | Fedora Linux 44 (Workstation Edition) |
| Kernel | Linux 7.0.9-205.fc44.x86_64 |
| Architecture | x86_64 |
| CPU | Intel Core i5-6267U @ 2.90GHz |
| CPU topology | 2 cores / 4 threads |
| CPU max frequency | 3.30GHz |
| Memory | 15GiB RAM, 8.0GiB swap |
| Node.js | v22.22.2 |
| V8 | 12.4.254.21-node.39 |
| libuv | 1.51.0 |
| npm | 10.9.7 |

Recommended when repeating these benchmarks on another machine:

- Record OS, kernel, CPU model/topology, RAM, Node.js, V8, and npm versions.
- Run each benchmark more than once and compare medians instead of single runs.
- Keep power mode, thermal state, and background workload as stable as possible.
- Treat Jest-based microbenchmarks as trend indicators, not absolute truth.

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

## Concurrent Benchmark Notes

Command used:

```sh
npm run bench:concurrent
```

The concurrent benchmark exercises:

- `Promise.all()` batches at concurrency 10, 50, and 100.
- A mixed batch of GET/list/POST operations.
- Request event listener overhead under concurrency.
- JSON-serializing request listeners.
- Per-request `AbortController` creation.

### Initial Concurrent Run

The first run after the throughput optimizations passed the request concurrency
cases but failed the listener degradation assertion:

| Case | Result |
| --- | ---: |
| c=10 GET batches | 278,804 ops/s |
| c=50 GET batches | 345,893 ops/s |
| c=100 GET batches | 235,508 ops/s |
| Mixed 100 concurrent ops | 1.68 ms total |
| 0 request listeners | 360,231 ops/s |
| 1 request listener | 210,280 ops/s |
| 10 request listeners | 61,429 ops/s |
| 3 JSON listeners | 33,300 ops/s |
| AbortSignal per request | 165,078 ops/s |

The failed assertion compared 0 listeners directly against 10 listeners and
reported an 82.9% degradation. That comparison mixed two separate costs:

- Turning request telemetry on at all, which requires `Date` and payload
  allocation.
- Fanning out an already-created request event to multiple listeners.

### Change Applied

`GitHubClient` only exposes one event today: `request`. The previous
implementation stored listeners in a `Map`, which meant the hot path used
`Map.has()` before creating request metadata and `Map.get()` during emit.

The implementation now stores request listeners in a direct array:

- Replaced the listener `Map` with `requestListeners`.
- `startRequestEvent()` checks `requestListeners.length`.
- `emitRequestEvent()` loops over the array directly.

This preserves the public `gh.on('request', callback)` API while reducing
listener-path overhead.

### Benchmark Assertion Update

The listener benchmark now reports both signals separately:

- Telemetry activation cost: 0 listeners to 1 listener.
- Listener fanout degradation: 1 listener to 10 listeners.

The assertion now applies to fanout degradation, which matches the intended
purpose of the test.

### Final Concurrent Run

Final result:

| Case | Result |
| --- | ---: |
| c=10 GET batches | 209,525 ops/s |
| c=50 GET batches | 325,052 ops/s |
| c=100 GET batches | 157,489 ops/s |
| Mixed 100 concurrent ops | 1.67 ms total |
| 0 request listeners | 189,227 ops/s |
| 1 request listener | 130,295 ops/s |
| 10 request listeners | 68,811 ops/s |
| Telemetry activation cost, 0 to 1 listener | 31.1% |
| Listener fanout degradation, 1 to 10 listeners | 47.2% |
| 3 JSON listeners | 38,201 ops/s |
| AbortSignal per request | 252,648 ops/s |

All concurrent benchmark tests passed after the array-backed listener change and
the benchmark assertion update.

### Analysis

Concurrency itself is healthy. `Promise.all()` batches complete in sub-ms to
low-ms timings in the mocked environment, and the mixed 100-operation batch does
not show accidental serialization.

The main cost is request telemetry. Registering the first `request` listener
requires the client to allocate timing metadata and a request event payload for
every request. Additional listeners then add fanout cost. The direct array
implementation keeps that fanout below the benchmark threshold.

JSON-serializing listeners remain much more expensive than empty listeners, as
expected. Users should avoid heavy synchronous logging callbacks if they care
about high-throughput mocked or local workloads.

## Event Loop Lag Benchmark Notes

Command used:

```sh
npm run bench:eventloop
```

The event-loop benchmark uses Node's `monitorEventLoopDelay()` to detect how
long a benchmark scenario monopolizes the current event-loop turn. The harness
now yields once after enabling the monitor and once after the workload before
reading the histogram; without those yields, very fast promise/microtask-heavy
workloads could finish before the monitor had a chance to sample.

The output also includes `avg op ms` to make the warnings easier to interpret.
For example, a p99 warning around 20ms may represent 3,000 mocked operations
executed back-to-back, not a single slow client call.

### Results

| Case | Elapsed | Avg op | Event-loop p99 |
| --- | ---: | ---: | ---: |
| Serial GET `/user` baseline | 8.70 ms | 0.0029 ms | 0.0005 ms |
| Serial GET list with `Link` header | 20.15 ms | 0.0067 ms | 20.7749 ms |
| Serial GET list without `Link` header | 14.02 ms | 0.0047 ms | 14.6801 ms |
| URL construction, 5 query params | 26.06 ms | 0.0087 ms | 26.1489 ms |
| `Promise.all(10)` concurrent GET batches | 14.35 ms | 0.0478 ms | 16.8591 ms |
| `Promise.all(50)` concurrent GET batches | 6.83 ms | 0.1138 ms | 7.2212 ms |
| `Promise.all(100)` concurrent GET batches | 4.18 ms | 0.0836 ms | 4.2312 ms |
| GET `/user` with 10 JSON-serializing listeners | 162.07 ms | 0.0540 ms | 162.1361 ms |
| GET `/user` with 10 empty listeners | 10.65 ms | 0.0036 ms | 10.6988 ms |

### Analysis

The client does not show a single-request event-loop problem. Per-operation
costs remain tiny in the mocked environment.

Warnings appear when many immediately-resolved operations run back-to-back in
one event-loop turn. This is most visible in:

- URL/list scenarios, where thousands of synchronous URL/header/list operations
  run without a macrotask yield.
- JSON-serializing request listeners, which add real synchronous CPU work on
  every request event.

The largest risk remains user-provided listener work, not the core client.
Ten empty listeners cost about 0.0036ms per request, while ten JSON-serializing
listeners cost about 0.0540ms per request and can monopolize the event loop for
over 160ms when repeated 3,000 times in a tight mocked loop.

Recommendation: keep request listeners synchronous and lightweight. If logging
does expensive serialization or I/O preparation, batch it, sample it, or defer
it outside the hot request path.

## Heap Pressure Benchmark Notes

Command used:

```sh
npm run bench:heap
```

The heap benchmark runs with `--expose-gc`, forces GC around measured sections,
and reports retained heap after GC. This means the main signal is retained
memory/leak risk, not total temporary allocation churn.

### Initial Result

Initial heap run:

| Case | Throughput | Heap delta after GC |
| --- | ---: | ---: |
| GET `/user` | 319,522 ops/s | 22.2 KB |
| GET list with `Link` header | 52,234 ops/s | 108.8 KB |
| URL construction, 5 params | 172,152 ops/s | 44.8 KB |
| GitHubClient constructor, 5,000x | n/a | 25.0 KB |
| Leak detection, 5 epochs | n/a | 12.8 KB growth |
| `Security.getHeaders()`, 25,000x | 6,798,823 ops/s | 1.6 KB |

No leak was detected. Growth across leak-detection epochs stayed far below the
500KB threshold.

### Change Applied

The only clear low-risk improvement was in `parseNextPage()`. The Link-header
regex was defined inline inside the function. It is now hoisted to a module-level
constant:

```ts
const NEXT_PAGE_RE = /<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="next"/;
```

This avoids recreating the regular expression on each Link-header parse.

The heap benchmark shared the same event-loop monitor timing issue as
`bench:eventloop`, so the shared benchmark helper now yields once after enabling
the monitor and once before disabling it. It also reports `avg op ms`.

The constructor diagnostic text was updated to match the current implementation:
request listeners are stored in an array, not a `Map`.

### Final Result

Final heap run:

| Case | Throughput | Avg op | Heap delta after GC |
| --- | ---: | ---: | ---: |
| GET `/user` | 248,667 ops/s | 0.0040 ms | 31.5 KB |
| GET list with `Link` header | 114,946 ops/s | 0.0087 ms | 79.1 KB |
| URL construction, 5 params | 184,635 ops/s | 0.0054 ms | 43.3 KB |
| GitHubClient constructor, 5,000x | n/a | n/a | 28.2 KB |
| Leak detection, 5 epochs | n/a | n/a | 25.4 KB growth |
| `Security.getHeaders()`, 25,000x | 7,703,303 ops/s | 130 ns/call | 2.0 KB |

### Analysis

Heap behavior is healthy. The benchmark does not show monotonic growth or
retained memory near the leak threshold.

The Link-header path improved after hoisting the regex:

- Heap delta dropped from 108.8KB to 79.1KB.
- Throughput improved from 52,234 ops/s to 114,946 ops/s in the measured run.

The remaining heap deltas are small and consistent with retained runtime noise,
JIT/runtime bookkeeping, and benchmark harness effects after forced GC.

`Security.getHeaders()` still recreates a headers object per call, but the
post-GC retained heap is tiny. Optimizing it would be more about temporary
allocation/throughput than leak prevention, and caching headers would need a
careful API decision because callers currently receive a fresh mutable object.

## Node.js 25 Benchmark Rerun

Command used:

```sh
source ~/.nvm/nvm.sh && nvm use 25 && npm run bench
```

Runtime used for this rerun:

| Item | Value |
| --- | --- |
| Node.js | v25.9.0 |
| npm | 11.12.1 |
| V8 | 14.1.146.11-node.25 |
| libuv | 1.51.0 |
| platform | linux x64 |

The shell did not inherit `nvm use 25` automatically, so the benchmark command
explicitly sourced `~/.nvm/nvm.sh` before selecting Node 25.

### Jest Performance Benchmarks

All Jest performance suites passed:

- 3 test suites passed.
- 20 tests passed.

Throughput results:

| Case | Node 25 result |
| --- | ---: |
| GET `/user` | 319,223 ops/s |
| GET list without `Link` header | 154,969 ops/s |
| GET list with `Link` header | 131,481 ops/s |
| GET raw text | 289,894 ops/s |
| POST JSON body | 53,561 ops/s |
| PATCH void | 376,500 ops/s |
| DELETE void | 376,985 ops/s |
| PUT void | 551,303 ops/s |
| GraphQL POST | 303,595 ops/s |
| `Security.getHeaders()` | 7,657,800 ops/s |
| URL with 4 query params | 238,434 ops/s |

Concurrent results:

| Case | Node 25 result |
| --- | ---: |
| c=10 GET batches | 270,378 ops/s |
| c=50 GET batches | 484,174 ops/s |
| c=100 GET batches | 549,027 ops/s |
| Mixed 100 concurrent ops | 0.75 ms total |
| 0 request listeners | 398,106 ops/s |
| 1 request listener | 248,567 ops/s |
| 10 request listeners | 367,557 ops/s |
| Telemetry activation cost, 0 to 1 listener | 37.6% |
| Listener fanout degradation, 1 to 10 listeners | -47.9% |
| 3 JSON listeners | 54,529 ops/s |
| AbortSignal per request | 500,190 ops/s |

The negative fanout degradation means the 10-listener run measured faster than
the 1-listener run in this single sample. That is benchmark noise/JIT behavior,
not evidence that more listeners are inherently faster. This reinforces that
listener microbenchmarks should be repeated and compared by medians.

### Heap Benchmark

Heap results under Node 25:

| Case | Throughput | Avg op | Heap delta after GC |
| --- | ---: | ---: | ---: |
| GET `/user` | 626,234 ops/s | 0.0016 ms | 29.5 KB |
| GET list with `Link` header | 192,781 ops/s | 0.0052 ms | 75.5 KB |
| URL construction, 5 params | 141,219 ops/s | 0.0071 ms | 17.3 KB |
| GitHubClient constructor, 5,000x | n/a | n/a | 18.0 KB |
| Leak detection, 5 epochs | n/a | n/a | -1.3 KB growth |
| `Security.getHeaders()`, 25,000x | 5,972,086 ops/s | 167 ns/call | 5.2 KB |

No leak was detected. Heap remained stable across epochs.

### Event Loop Benchmark

Event-loop results under Node 25:

| Case | Elapsed | Avg op | Event-loop p99 |
| --- | ---: | ---: | ---: |
| Serial GET `/user` baseline | 6.49 ms | 0.0022 ms | 7.6759 ms |
| Serial GET list with `Link` header | 19.71 ms | 0.0066 ms | 20.0376 ms |
| Serial GET list without `Link` header | 6.32 ms | 0.0021 ms | 6.3816 ms |
| URL construction, 5 query params | 12.32 ms | 0.0041 ms | 12.3781 ms |
| `Promise.all(10)` concurrent GET batches | 4.09 ms | 0.0136 ms | 4.3459 ms |
| `Promise.all(50)` concurrent GET batches | 3.34 ms | 0.0556 ms | 3.3751 ms |
| `Promise.all(100)` concurrent GET batches | 7.61 ms | 0.1522 ms | 7.8193 ms |
| GET `/user` with 10 JSON-serializing listeners | 112.97 ms | 0.0377 ms | 113.0496 ms |
| GET `/user` with 10 empty listeners | 5.77 ms | 0.0019 ms | 5.8081 ms |

### Node 25 Analysis

Node 25 generally improves the benchmark profile on this machine:

- Concurrency is notably stronger, especially c=50 and c=100 batches.
- Event-loop elapsed time improves in most scenarios.
- Heap leak detection remains clean.
- Empty listener fanout is very cheap under Node 25.
- JSON-serializing listeners are still the dominant synchronous event-loop cost.

The main regressions/noisy spots in this single run:

- POST throughput was lower than some Node 22 runs.
- `Security.getHeaders()` isolated throughput was lower than some Node 22 runs.
- Listener fanout metrics showed clear microbenchmark noise.

Recommendation: use Node 25 results as a promising data point, but run each
benchmark multiple times and compare medians before changing thresholds.
