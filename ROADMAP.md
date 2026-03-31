# Roadmap

## Legend
- ✅ Implemented
- ⬜ Pending

---

## GitHubClient (entry point)

| Method | Endpoint | Status |
|--------|----------|--------|
| `currentUser()` | `GET /user` | ✅ |
| `user(login)` | — chainable | ✅ |
| `org(name)` | — chainable | ✅ |
| `repo(owner, name)` | — chainable | ✅ |
| `searchRepos(params)` | `GET /search/repositories` | ✅ |

---

## OrganizationResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /orgs/{org}` | ✅ |
| `repos(params?)` | `GET /orgs/{org}/repos` | ✅ |
| `repo(name)` | — chainable | ✅ |
| `members(params?)` | `GET /orgs/{org}/members` | ✅ |
| `createRepo(data)` | `POST /orgs/{org}/repos` | ✅ |

---

## UserResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /users/{username}` | ✅ |
| `repos(params?)` | `GET /users/{username}/repos` | ✅ |
| `repo(name)` | — chainable | ✅ |
| `followers(params?)` | `GET /users/{username}/followers` | ✅ |
| `following(params?)` | `GET /users/{username}/following` | ✅ |

---

## RepositoryResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /repos/{owner}/{repo}` | ✅ |
| `pullRequests(params?)` | `GET /repos/{owner}/{repo}/pulls` | ✅ |
| `pullRequest(number)` | — chainable | ✅ |
| `commits(params?)` | `GET /repos/{owner}/{repo}/commits` | ✅ |
| `commit(ref)` | — chainable | ✅ |
| `branches(params?)` | `GET /repos/{owner}/{repo}/branches` | ✅ |
| `branch(name)` | `GET /repos/{owner}/{repo}/branches/{branch}` | ✅ |
| `tags(params?)` | `GET /repos/{owner}/{repo}/tags` | ✅ |
| `releases(params?)` | `GET /repos/{owner}/{repo}/releases` | ✅ |
| `latestRelease()` | `GET /repos/{owner}/{repo}/releases/latest` | ✅ |
| `forks(params?)` | `GET /repos/{owner}/{repo}/forks` | ✅ |
| `webhooks(params?)` | `GET /repos/{owner}/{repo}/hooks` | ✅ |
| `contents(path?, params?)` | `GET /repos/{owner}/{repo}/contents/{path}` | ✅ |
| `raw(filePath, params?)` | `GET /repos/{owner}/{repo}/contents/{path}` (raw) | ✅ |
| `topics()` | `GET /repos/{owner}/{repo}/topics` | ✅ |
| `contributors(params?)` | `GET /repos/{owner}/{repo}/contributors` | ✅ |
| `createFork(data?)` | `POST /repos/{owner}/{repo}/forks` | ⬜ |
| `createWebhook(data)` | `POST /repos/{owner}/{repo}/hooks` | ⬜ |
| `updateWebhook(hookId, data)` | `PATCH /repos/{owner}/{repo}/hooks/{hook_id}` | ⬜ |
| `deleteWebhook(hookId)` | `DELETE /repos/{owner}/{repo}/hooks/{hook_id}` | ⬜ |
| `issues(params?)` | `GET /repos/{owner}/{repo}/issues` | ⬜ |
| `issue(number)` | — chainable | ⬜ |
| `createIssue(data)` | `POST /repos/{owner}/{repo}/issues` | ⬜ |

---

## PullRequestResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /repos/{owner}/{repo}/pulls/{pull_number}` | ✅ |
| `commits(params?)` | `GET /repos/{owner}/{repo}/pulls/{pull_number}/commits` | ✅ |
| `files(params?)` | `GET /repos/{owner}/{repo}/pulls/{pull_number}/files` | ✅ |
| `reviews(params?)` | `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews` | ✅ |
| `reviewComments(params?)` | `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments` | ✅ |
| `isMerged()` | `GET /repos/{owner}/{repo}/pulls/{pull_number}/merge` | ✅ |
| `merge(data?)` | `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge` | ⬜ |
| `createReview(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` | ⬜ |
| `requestReviewers(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers` | ⬜ |
| `addComment(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments` | ⬜ |
| `update(data)` | `PATCH /repos/{owner}/{repo}/pulls/{pull_number}` | ⬜ |

---

## CommitResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /repos/{owner}/{repo}/commits/{ref}` | ✅ |
| `statuses(params?)` | `GET /repos/{owner}/{repo}/statuses/{sha}` | ✅ |
| `combinedStatus()` | `GET /repos/{owner}/{repo}/commits/{ref}/status` | ✅ |
| `checkRuns(params?)` | `GET /repos/{owner}/{repo}/commits/{ref}/check-runs` | ✅ |
| `createStatus(data)` | `POST /repos/{owner}/{repo}/statuses/{sha}` | ⬜ |
| `comments(params?)` | `GET /repos/{owner}/{repo}/commits/{commit_sha}/comments` | ⬜ |
| `addComment(data)` | `POST /repos/{owner}/{repo}/commits/{commit_sha}/comments` | ⬜ |
