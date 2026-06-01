## [1.16.3](https://github.com/ElJijuna/github-api-client/compare/v1.16.2...v1.16.3) (2026-06-01)


### Bug Fixes

* satisfy shared ESLint config rules ([d9ef7ba](https://github.com/ElJijuna/github-api-client/commit/d9ef7ba91e389b0ca880d4d12ca44042b343a31e))

# [1.16.0](https://github.com/ElJijuna/github-api-client/compare/v1.15.0...v1.16.0) (2026-05-25)


### Features

* add addComment and update methods to IssueResource ([ebded81](https://github.com/ElJijuna/github-api-client/commit/ebded81f59eec31d4c667de2b22e555ca53eb847))
* add api method to obtainer languages composition from repository ([259e8fe](https://github.com/ElJijuna/github-api-client/commit/259e8fe1aa9a3538fc07c936ef6158283293c804))
* add collaborator management methods to RepositoryResource ([08a39c0](https://github.com/ElJijuna/github-api-client/commit/08a39c026a9cf3a9d4bf5fc52761a4bde0e1c4d8))
* add contribution breakdown GraphQL methods to UserResource ([7485c5e](https://github.com/ElJijuna/github-api-client/commit/7485c5e4111586128caa1f28bfd21dd96e926b8e))
* add label CRUD methods to RepositoryResource ([882337b](https://github.com/ElJijuna/github-api-client/commit/882337b9aa51a1519a68b5906a2252b26a96aadc))
* add milestone CRUD methods to RepositoryResource ([b84d506](https://github.com/ElJijuna/github-api-client/commit/b84d50649160ba309ef5b3f4c6e0e4592e4dd0de))
* add release CRUD methods to RepositoryResource ([4688662](https://github.com/ElJijuna/github-api-client/commit/468866243ecbf7ce5e4584335acf3cf5fbd22a37))
* add searchUsers and searchCode methods to GitHubClient ([1813e8a](https://github.com/ElJijuna/github-api-client/commit/1813e8aa453de75a6cb60b9404abb789644cb8d5))
* add workflow management methods to RepositoryResource ([5205160](https://github.com/ElJijuna/github-api-client/commit/5205160a4b367869a5e0aed0c6a3490741f899fc))

# [1.15.0](https://github.com/ElJijuna/github-api-client/compare/v1.14.0...v1.15.0) (2026-05-24)


### Features

* add orgnizations from user ([a540a9e](https://github.com/ElJijuna/github-api-client/commit/a540a9e294247e22c63cb9b8f75ed4e7f33b9d95))

# [1.14.0](https://github.com/ElJijuna/github-api-client/compare/v1.13.0...v1.14.0) (2026-05-24)


### Features

* add socialAccounts() method to UserResource ([9a1185c](https://github.com/ElJijuna/github-api-client/commit/9a1185c1708bfc888c3976d0f5253d36e98501da))

# [1.13.0](https://github.com/ElJijuna/github-api-client/compare/v1.12.0...v1.13.0) (2026-05-24)


### Features

* add GitTrees methods to return tree repository from github repo ([9341427](https://github.com/ElJijuna/github-api-client/commit/9341427b29a2e43f452b11884349bd993a725d07))

# [1.12.0](https://github.com/ElJijuna/github-api-client/compare/v1.11.0...v1.12.0) (2026-05-23)


### Features

* add new method multipleRaw ([cbf8a61](https://github.com/ElJijuna/github-api-client/commit/cbf8a61b6697d0cf7ebbc1f72fb37f868b08df27))

# [1.11.0](https://github.com/ElJijuna/github-api-client/compare/v1.10.0...v1.11.0) (2026-05-19)
# [1.10.0](https://github.com/ElJijuna/github-api-client/compare/v1.9.1...v1.10.0) (2026-05-13)


### Features

* add notifications, cross-repo issues, issue search, and workflow runs ([c06f729](https://github.com/ElJijuna/github-api-client/commit/c06f729b7037b04fc14e43d45949b02dd045a8ca))
* add GitHub GraphQL API support with contributionMap() ([00d3560](https://github.com/ElJijuna/github-api-client/commit/00d3560dc88f800162624285fed997c161a3a3be))

## [1.9.1](https://github.com/ElJijuna/github-api-client/compare/v1.9.0...v1.9.1) (2026-05-11)


### Bug Fixes

* remove hardcoded issue [#123](https://github.com/ElJijuna/github-api-client/issues/123) from release PR template ([8100444](https://github.com/ElJijuna/github-api-client/commit/81004440087d67d9f8335fc970f7eabbd0b462b5))

# [1.9.0](https://github.com/ElJijuna/github-api-client/compare/v1.8.0...v1.9.0) (2026-05-11)


### Features

* **PullRequestResource:** implement merge, createReview, requestReviewers, addComment, and update ([02d09ac](https://github.com/ElJijuna/github-api-client/commit/02d09ac519bc74e6fae430b802a2e7fcce8f6966)), closes [#9](https://github.com/ElJijuna/github-api-client/issues/9)

# [1.7.0](https://github.com/ElJijuna/github-api-client/compare/v1.6.0...v1.7.0) (2026-04-30)


### Features

* **CommitResource:** implement createStatus, comments, and addComment ([d051349](https://github.com/ElJijuna/github-api-client/commit/d051349332276b8d450e7fb18df662cf014585b8)), closes [#10](https://github.com/ElJijuna/github-api-client/issues/10)
* **CommitResource:** implement createStatus, comments, and addComment ([ee33c38](https://github.com/ElJijuna/github-api-client/commit/ee33c3836cbd1292480de3a1b7d618999ae881e7)), closes [#10](https://github.com/ElJijuna/github-api-client/issues/10)

## [1.5.1](https://github.com/ElJijuna/github-api-client/compare/v1.5.0...v1.5.1) (2026-04-17)


### Bug Fixes

* remove hardcoded issue [#123](https://github.com/ElJijuna/github-api-client/issues/123) from PR template to prevent semantic-release failure ([6c1c6d2](https://github.com/ElJijuna/github-api-client/commit/6c1c6d20509fe8e2ee24061f80843f302b97d34e))

# [1.4.0](https://github.com/ElJijuna/github-api-client/compare/v1.3.0...v1.4.0) (2026-04-16)


### Features

* add AbortSignal support to all resource methods [#4](https://github.com/ElJijuna/github-api-client/issues/4) ([ae06320](https://github.com/ElJijuna/github-api-client/commit/ae063208a64671e6b9b1ec6ebc82ff6106a379dc))

# Changelog

All notable changes to this project will be documented in this file.

This file is generated automatically by [semantic-release](https://semantic-release.gitbook.io/semantic-release/) on every release.
