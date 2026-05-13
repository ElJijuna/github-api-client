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
| `graphql<T>(query, variables?)` | `POST /graphql` | ✅ |

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
| `publicEvents(params?)` | `GET /users/{username}/events/public` | ✅ |
| `contributionMap(params?)` | `POST /graphql` — `contributionCalendar` | ✅ |

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
| `createFork(data?)` | `POST /repos/{owner}/{repo}/forks` | ✅ |
| `createWebhook(data)` | `POST /repos/{owner}/{repo}/hooks` | ✅ |
| `updateWebhook(hookId, data)` | `PATCH /repos/{owner}/{repo}/hooks/{hook_id}` | ✅ |
| `deleteWebhook(hookId)` | `DELETE /repos/{owner}/{repo}/hooks/{hook_id}` | ✅ |
| `issues(params?)` | `GET /repos/{owner}/{repo}/issues` | ✅ |
| `issue(number)` | — chainable | ✅ |
| `createIssue(data)` | `POST /repos/{owner}/{repo}/issues` | ✅ |

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
| `merge(data?)` | `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge` | ✅ |
| `createReview(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews` | ✅ |
| `requestReviewers(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers` | ✅ |
| `addComment(data)` | `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments` | ✅ |
| `update(data)` | `PATCH /repos/{owner}/{repo}/pulls/{pull_number}` | ✅ |

---

## CommitResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /repos/{owner}/{repo}/commits/{ref}` | ✅ |
| `statuses(params?)` | `GET /repos/{owner}/{repo}/statuses/{sha}` | ✅ |
| `combinedStatus()` | `GET /repos/{owner}/{repo}/commits/{ref}/status` | ✅ |
| `checkRuns(params?)` | `GET /repos/{owner}/{repo}/commits/{ref}/check-runs` | ✅ |
| `createStatus(data)` | `POST /repos/{owner}/{repo}/statuses/{sha}` | ✅ |
| `comments(params?)` | `GET /repos/{owner}/{repo}/commits/{commit_sha}/comments` | ✅ |
| `addComment(data)` | `POST /repos/{owner}/{repo}/commits/{commit_sha}/comments` | ✅ |

---

## GistResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `listGists(params?)` | `GET /gists` | ✅ |
| `gist(gistId).get()` | `GET /gists/{gist_id}` | ✅ |
| `createGist(data)` | `POST /gists` | ✅ |
| `gist(gistId).update(data)` | `PATCH /gists/{gist_id}` | ✅ |
| `gist(gistId).delete()` | `DELETE /gists/{gist_id}` | ✅ |
| `gist(gistId).commits(params?)` | `GET /gists/{gist_id}/commits` | ✅ |
| `gist(gistId).fork()` | `POST /gists/{gist_id}/forks` | ✅ |
| `gist(gistId).forks(params?)` | `GET /gists/{gist_id}/forks` | ✅ |
| `gist(gistId).star()` | `PUT /gists/{gist_id}/star` | ✅ |
| `gist(gistId).unstar()` | `DELETE /gists/{gist_id}/star` | ✅ |
| `gist(gistId).isStarred()` | `GET /gists/{gist_id}/star` | ✅ |
| `gist(gistId).comments(params?)` | `GET /gists/{gist_id}/comments` | ✅ |
| `gist(gistId).addComment(data)` | `POST /gists/{gist_id}/comments` | ✅ |
| `gist(gistId).updateComment(commentId, data)` | `PATCH /gists/{gist_id}/comments/{comment_id}` | ✅ |
| `gist(gistId).deleteComment(commentId)` | `DELETE /gists/{gist_id}/comments/{comment_id}` | ✅ |

---

## AdvisoryResource (Global)

| Method | Endpoint | Status |
|--------|----------|--------|
| `advisories(params?)` | `GET /advisories` | ✅ |
| `advisory(ghsaId)` | `GET /advisories/{ghsa_id}` | ✅ |

## AdvisoryResource (Repository)

| Method | Endpoint | Status |
|--------|----------|--------|
| `repoAdvisories(params?)` | `GET /repos/{owner}/{repo}/security-advisories` | ✅ |
| `createAdvisory(data)` | `POST /repos/{owner}/{repo}/security-advisories` | ✅ |
| `repoAdvisory(ghsaId)` | `GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}` | ✅ |
| `updateAdvisory(ghsaId, data)` | `PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}` | ✅ |
| `requestCve(ghsaId)` | `POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve` | ✅ |

---

## Cross-cutting concerns

| Feature | Scope | Status |
|---------|-------|--------|
| `AbortSignal` support | All resource methods (pass `signal` to `fetch`) | ✅ |

---

## GraphQL API — Pending

Data available via `POST /graphql` that can be added as dedicated methods.
The generic `gh.graphql<T>()` escape hatch already works for all of these.

### UserResource — contributions

| Method (proposed) | GraphQL field | Notes |
|---|---|---|
| `contributionMap(params?)` | `contributionsCollection.contributionCalendar` | ✅ Implemented |
| `commitContributionsByRepo(params?)` | `contributionsCollection.commitContributionsByRepository` | Commits per repo with counts |
| `pullRequestContributionsByRepo(params?)` | `contributionsCollection.pullRequestContributionsByRepository` | PRs opened per repo |
| `reviewContributionsByRepo(params?)` | `contributionsCollection.pullRequestReviewContributionsByRepository` | Reviews per repo |
| `issueContributionsByRepo(params?)` | `contributionsCollection.issueContributionsByRepository` | Issues opened per repo |
| `pinnedItems()` | `user.pinnedItems` | Pinned repos/gists on profile (up to 6) |
| `starredRepositories(params?)` | `user.starredRepositories` | Repos starred by the user, cursor-paginated |
| `watching(params?)` | `user.watching` | Repos the user is watching |
| `sponsoring(params?)` | `user.sponsorshipsAsSponsor` | Users/orgs the user sponsors |
| `sponsors(params?)` | `user.sponsorshipsAsMaintainer` | Users who sponsor this user |

### RepositoryResource — GraphQL-only data

| Method (proposed) | GraphQL field | Notes |
|---|---|---|
| `languageBreakdown()` | `repository.languages` | Byte count per language (REST only gives primary language) |
| `discussions(params?)` | `repository.discussions` | GitHub Discussions — not available in REST |
| `discussionCategories()` | `repository.discussionCategories` | Categories for discussions |
| `milestones(params?)` | `repository.milestones` | Milestones with issue/PR counts |
| `labels(params?)` | `repository.labels` | All labels with color and description |
| `deployments(params?)` | `repository.deployments` | Deployments with environment and state |
| `environments(params?)` | `repository.environments` | Deployment environments |
| `dependencyManifests()` | `repository.dependencyGraphManifests` | Dependency graph (requires `repo` scope) |
| `vulnerabilityAlerts(params?)` | `repository.vulnerabilityAlerts` | Dependabot alerts |
| `codeOfConduct()` | `repository.codeOfConduct` | CoC name and URL |
| `licenseInfo()` | `repository.licenseInfo` | Full license details beyond REST |

### OrganizationResource — GraphQL-only data

| Method (proposed) | GraphQL field | Notes |
|---|---|---|
| `teams(params?)` | `organization.teams` | Org teams with members (not available anonymously) |
| `projectsV2(params?)` | `organization.projectsV2` | GitHub Projects v2 |
| `packages(params?)` | `organization.packages` | GitHub Packages published by the org |
| `sponsoring(params?)` | `organization.sponsorshipsAsSponsor` | Orgs/users the org sponsors |
| `sponsors(params?)` | `organization.sponsorshipsAsMaintainer` | Sponsors of the org |
