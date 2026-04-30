# gh-api-client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript client for the [GitHub REST API](https://docs.github.com/en/rest).
Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

---

## Installation

```bash
npm install gh-api-client
```

---

## Quick start

```typescript
import { GitHubClient } from 'gh-api-client';

const gh = new GitHubClient({
  token: 'ghp_yourPersonalAccessToken',
});
```

For **GitHub Enterprise Server**, pass a custom `apiUrl`:

```typescript
const gh = new GitHubClient({
  token:  'ghp_yourPersonalAccessToken',
  apiUrl: 'https://github.mycompany.com/api/v3',
});
```

---

## API reference

### Current user

```typescript
const me = await gh.currentUser();
// { login: 'octocat', name: 'The Octocat', ... }
```

### Users

```typescript
// Get a user's profile
const user = await gh.user('octocat');

// List a user's public repositories
const repos = await gh.user('octocat').repos();
const repos = await gh.user('octocat').repos({ sort: 'updated', per_page: 50 });

// Navigate into a user repository
const repo    = await gh.user('octocat').repo('Hello-World');
const content = await gh.user('octocat').repo('Hello-World').raw('README.md');

// Followers and following
const followers = await gh.user('octocat').followers();
const following = await gh.user('octocat').following();

// List public events performed by a user
const events = await gh.user('octocat').publicEvents();
const events = await gh.user('octocat').publicEvents({ per_page: 30 });
```

### Organizations

```typescript
// Get an organization
const org = await gh.org('github');

// List an organization's repositories
const repos = await gh.org('github').repos();
const repos = await gh.org('github').repos({ type: 'public', per_page: 100 });

// List members
const members = await gh.org('github').members();
const members = await gh.org('github').members({ role: 'admin' });

// Navigate into an org repository
const repo = await gh.org('github').repo('linguist');
const prs  = await gh.org('github').repo('linguist').pullRequests({ state: 'open' });
```

### Repositories

```typescript
// Shortcut: access any repo by owner + name
const repo = await gh.repo('octocat', 'Hello-World');

// Repository info
const repo = await gh.repo('octocat', 'Hello-World');
// { id, name, full_name, owner, private, default_branch, ... }

// Forks
const forks = await gh.repo('octocat', 'Hello-World').forks();
const forks = await gh.repo('octocat', 'Hello-World').forks({ sort: 'newest' });

// Webhooks
const hooks = await gh.repo('octocat', 'Hello-World').webhooks();

// Topics
const topics = await gh.repo('octocat', 'Hello-World').topics();
// ['typescript', 'api-client']

// Contributors
const contributors = await gh.repo('octocat', 'Hello-World').contributors();

// Raw file content (returns string)
const content = await gh.repo('octocat', 'Hello-World').raw('README.md');
const content = await gh.repo('octocat', 'Hello-World').raw('src/index.ts', { ref: 'main' });

// File/directory contents (returns GitHubContent or GitHubContent[])
const file = await gh.repo('octocat', 'Hello-World').contents('README.md');
const dir  = await gh.repo('octocat', 'Hello-World').contents('src');
const root = await gh.repo('octocat', 'Hello-World').contents();
```

### Branches

```typescript
// List branches
const branches = await gh.repo('octocat', 'Hello-World').branches();
const branches = await gh.repo('octocat', 'Hello-World').branches({ protected: true });

// Get a single branch
const branch = await gh.repo('octocat', 'Hello-World').branch('main');
```

### Tags

```typescript
const tags = await gh.repo('octocat', 'Hello-World').tags();
const tags = await gh.repo('octocat', 'Hello-World').tags({ per_page: 50 });
```

### Releases

```typescript
// List releases
const releases = await gh.repo('octocat', 'Hello-World').releases();

// Get the latest published release
const latest = await gh.repo('octocat', 'Hello-World').latestRelease();
```

### Commits

```typescript
// List commits
const commits = await gh.repo('octocat', 'Hello-World').commits();
const commits = await gh.repo('octocat', 'Hello-World').commits({
  sha:    'main',
  path:   'src/index.ts',
  author: 'octocat',
  since:  '2024-01-01T00:00:00Z',
  until:  '2024-12-31T23:59:59Z',
});

// Get a single commit (includes stats and files)
const commit = await gh.repo('octocat', 'Hello-World').commit('abc123def456');

// Commit statuses (from external CI/CD via Statuses API)
const statuses = await gh.repo('octocat', 'Hello-World').commit('abc123').statuses();

// Combined status (aggregate of all statuses)
const combined = await gh.repo('octocat', 'Hello-World').commit('abc123').combinedStatus();
// { state: 'success', total_count: 3, statuses: [...] }

// GitHub Actions check runs
const checks = await gh.repo('octocat', 'Hello-World').commit('abc123').checkRuns();
const checks = await gh.repo('octocat', 'Hello-World').commit('abc123').checkRuns({ status: 'completed' });

// Create a commit status (e.g., from a CI/CD system)
const status = await gh.repo('octocat', 'Hello-World').commit('abc123').createStatus({
  state:       'success',
  context:     'ci/circleci',
  description: 'Build passed',
  target_url:  'https://ci.example.com/build/42',
});

// List comments on a commit
const comments = await gh.repo('octocat', 'Hello-World').commit('abc123').comments();

// Add a comment to a commit
const comment = await gh.repo('octocat', 'Hello-World').commit('abc123').addComment({
  body: 'Looks good to me!',
});
```

### Pull requests

```typescript
// List pull requests
const prs = await gh.repo('octocat', 'Hello-World').pullRequests();
const prs = await gh.repo('octocat', 'Hello-World').pullRequests({
  state:     'open',
  base:      'main',
  sort:      'updated',
  direction: 'desc',
  per_page:  50,
});

// Get a single pull request
const pr = await gh.repo('octocat', 'Hello-World').pullRequest(42);

// Commits in the PR
const commits = await gh.repo('octocat', 'Hello-World').pullRequest(42).commits();

// Changed files
const files = await gh.repo('octocat', 'Hello-World').pullRequest(42).files();

// Reviews
const reviews = await gh.repo('octocat', 'Hello-World').pullRequest(42).reviews();

// Inline review comments (diff comments)
const comments = await gh.repo('octocat', 'Hello-World').pullRequest(42).reviewComments();

// Check if merged
const merged = await gh.repo('octocat', 'Hello-World').pullRequest(42).isMerged();
// true | false

// Merge a pull request
const result = await gh.repo('octocat', 'Hello-World').pullRequest(42).merge();
const result = await gh.repo('octocat', 'Hello-World').pullRequest(42).merge({
  merge_method: 'squash',
  commit_title: 'feat: my feature (#42)',
});

// Submit a review
await gh.repo('octocat', 'Hello-World').pullRequest(42).createReview({ event: 'APPROVE' });
await gh.repo('octocat', 'Hello-World').pullRequest(42).createReview({
  event: 'REQUEST_CHANGES',
  body: 'Please fix the tests.',
});

// Request reviewers
await gh.repo('octocat', 'Hello-World').pullRequest(42).requestReviewers({
  reviewers: ['octocat'],
  team_reviewers: ['justice-league'],
});

// Add an inline diff comment
await gh.repo('octocat', 'Hello-World').pullRequest(42).addComment({
  body: 'Should this be a constant?',
  commit_id: 'abc123def456',
  path: 'src/index.ts',
  line: 10,
});

// Update pull request metadata
const updated = await gh.repo('octocat', 'Hello-World').pullRequest(42).update({
  title: 'feat: improved feature',
  state: 'closed',
});
```

### Issues

```typescript
// List issues in a repository
const issues = await gh.repo('octocat', 'Hello-World').issues();
const issues = await gh.repo('octocat', 'Hello-World').issues({ state: 'open', labels: 'bug' });

// Get a single issue
const issue = await gh.repo('octocat', 'Hello-World').issue(1);

// Create an issue
const newIssue = await gh.repo('octocat', 'Hello-World').createIssue({
  title: 'Something is broken',
  body:  'Steps to reproduce...',
  labels: ['bug'],
});
```

### Gists

```typescript
// List gists for the authenticated user
const gists = await gh.listGists();
const gists = await gh.listGists({ per_page: 50, since: '2024-01-01T00:00:00Z' });

// Get a single gist (awaitable directly)
const gist = await gh.gist('abc123');

// Create a gist
const newGist = await gh.createGist({
  description: 'My snippet',
  public: true,
  files: {
    'hello.ts': { content: 'console.log("hello")' },
  },
});

// Update a gist
const updated = await gh.gist('abc123').update({
  description: 'Updated description',
  files: {
    'hello.ts': { content: 'console.log("updated")' },
    'old.ts':   null, // deletes the file
  },
});

// Delete a gist
await gh.gist('abc123').delete();

// Commits and forks
const commits = await gh.gist('abc123').commits();
const fork    = await gh.gist('abc123').fork();
const forks   = await gh.gist('abc123').forks();

// Star / unstar
await gh.gist('abc123').star();
await gh.gist('abc123').unstar();
const starred = await gh.gist('abc123').isStarred(); // true | false

// Comments
const comments  = await gh.gist('abc123').comments();
const comment   = await gh.gist('abc123').addComment({ body: 'Great snippet!' });
const updated   = await gh.gist('abc123').updateComment(comment.id, { body: 'Even better!' });
await gh.gist('abc123').deleteComment(comment.id);
```

### Repository search

```typescript
// Search repositories using GitHub's search syntax
const results = await gh.searchRepos({ q: 'language:typescript stars:>1000' });
const results = await gh.searchRepos({ q: 'user:octocat', sort: 'stars', order: 'desc' });

console.log(`Found ${results.totalCount} repositories`);
results.values; // GitHubRepository[]
```

---

## Pagination

Every list method returns a `GitHubPagedResponse<T>`:

```typescript
const page = await gh.repo('octocat', 'Hello-World').commits({ per_page: 30 });

page.values      // GitHubCommit[]  — the items on this page
page.hasNextPage // boolean
page.nextPage    // number | undefined — pass as `page` to get the next page
page.totalCount  // number | undefined — only available on search endpoints
```

Iterate all pages:

```typescript
let page = 1;
let hasMore = true;

while (hasMore) {
  const res = await gh.repo('octocat', 'Hello-World').commits({ per_page: 100, page });
  process(res.values);
  hasMore = res.hasNextPage;
  page = res.nextPage ?? page + 1;
}
```

---

## Request events

Subscribe to every HTTP request made by the client for logging, monitoring, or debugging:

```typescript
gh.on('request', (event) => {
  console.log(`[${event.method}] ${event.url} → ${event.statusCode} (${event.durationMs}ms)`);
  if (event.error) {
    console.error('Request failed:', event.error.message);
  }
});
```

The `event` object contains:

| Field | Type | Description |
|---|---|---|
| `url` | `string` | Full URL that was requested |
| `method` | `'GET' \| 'POST' \| 'PATCH' \| 'DELETE' \| 'PUT'` | HTTP method used |
| `startedAt` | `Date` | When the request started |
| `finishedAt` | `Date` | When the request finished |
| `durationMs` | `number` | Duration in milliseconds |
| `statusCode` | `number \| undefined` | HTTP status code, if a response was received |
| `error` | `Error \| undefined` | Present only if the request failed |

Multiple listeners can be registered. `on()` returns `this` for chaining.

---

## Error handling

Non-2xx responses throw a `GitHubApiError` with the HTTP status code and status text:

```typescript
import { GitHubApiError } from 'gh-api-client';

try {
  await gh.repo('octocat', 'nonexistent-repo');
} catch (err) {
  if (err instanceof GitHubApiError) {
    console.log(err.status);     // 404
    console.log(err.statusText); // 'Not Found'
    console.log(err.message);    // 'GitHub API error: 404 Not Found'
    console.log(err.stack);      // full stack trace
  }
}
```

---

## Chainable resource pattern

Every resource that maps to a single entity implements `PromiseLike`, so you can **await it directly** or **chain methods** to access sub-resources:

```typescript
// Await directly → fetches the resource
const user = await gh.user('octocat');
const repo = await gh.repo('octocat', 'Hello-World');
const pr   = await gh.repo('octocat', 'Hello-World').pullRequest(42);

// Chain → access sub-resources without awaiting intermediate objects
const repos    = await gh.user('octocat').repos({ sort: 'updated' });
const commits  = await gh.repo('octocat', 'Hello-World').pullRequest(42).commits();
const statuses = await gh.org('github').repo('linguist').commit('abc123').statuses();
```

---

## Authentication

The client uses **Bearer token authentication**. Supported token types:

- **Personal Access Token (PAT)** — generate at GitHub → Settings → Developer settings → Personal access tokens
- **Fine-grained PAT** — recommended for scoped access
- **OAuth token** — from an OAuth App
- **GitHub App installation token** — for GitHub App integrations

```typescript
const gh = new GitHubClient({ token: 'ghp_yourToken' });
```

---

## TypeScript types

All domain types are exported:

```typescript
import type {
  // Pagination
  GitHubPagedResponse, PaginationParams,
  // Client
  GitHubClientOptions, RequestEvent, GitHubClientEvents,
  // Users & Orgs
  GitHubUser, UsersParams, SearchUsersParams,
  GitHubOrganization, OrgMembersParams,
  // Repositories
  GitHubRepository, ReposParams, ForksParams, SearchReposParams,
  // Pull Requests
  GitHubPullRequest, GitHubRef, GitHubLabel, GitHubMilestone, PullRequestsParams,
  MergeData, MergeResult, UpdatePullRequestData,
  GitHubReview, GitHubReviewComment, ReviewsParams, ReviewCommentsParams,
  CreateReviewData, AddCommentData, RequestReviewersData,
  GitHubPullRequestFile, PullRequestFilesParams,
  // Commits
  GitHubCommit, GitHubCommitFile, CommitsParams,
  GitHubCommitStatus, GitHubCombinedStatus, GitHubCheckRun, GitHubCommitComment,
  CommitStatusesParams, CheckRunsParams, CommitCommentsParams,
  CreateStatusData, CommitCommentData,
  // Branches, Tags, Releases
  GitHubBranch, BranchesParams,
  GitHubTag, TagsParams,
  GitHubRelease, GitHubReleaseAsset, ReleasesParams,
  // Webhooks & Content
  GitHubWebhook, WebhooksParams,
  GitHubContent, ContentParams,
  // Events
  GitHubEvent, GitHubActor, EventsParams,
  // Issues
  GitHubIssue, GitHubIssueComment, IssuesParams, CreateIssueData,
  // Gists
  GitHubGist, GistFile, GistCommit, GistFork, GistComment,
  GistsParams, CreateGistData, UpdateGistData, GistCommentData,
} from 'gh-api-client';
```

---

## License

[MIT](LICENSE)
