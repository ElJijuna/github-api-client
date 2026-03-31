---
name: Feature request
about: Suggest a new endpoint or capability
labels: enhancement
---

## What endpoint or feature do you need?

Describe the GitHub REST API endpoint or behavior you want added.
Include the HTTP method and path if applicable (e.g., `GET /repos/{owner}/{repo}/issues`).

## Proposed API

```typescript
// How you'd like to call it
const issues = await gh.repo('octocat', 'Hello-World').issues();
```

## Why is this useful?

Explain your use case.
