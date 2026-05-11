import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';
import type { GitHubRepository } from './Repository';

/**
 * Represents a git reference in a pull request (head or base).
 */
export interface GitHubRef {
  /** Branch name (e.g., `'main'`, `'feature/my-feature'`) */
  ref: string;
  /** Commit SHA at the tip of this ref */
  sha: string;
  /** `owner:branch` label */
  label: string;
  /** The repository this ref belongs to */
  repo: GitHubRepository;
  /** The user who owns the ref's repository */
  user: GitHubUser;
}

/**
 * Represents a GitHub label on a pull request or issue.
 */
export interface GitHubLabel {
  /** Unique numeric label ID */
  id: number;
  /** Label name */
  name: string;
  /** Hex color code (without `#`) */
  color: string;
  /** Label description */
  description: string | null;
  /** Whether this is a default label */
  default: boolean;
}

/**
 * Represents a GitHub milestone.
 */
export interface GitHubMilestone {
  /** Unique numeric milestone ID */
  id: number;
  /** Milestone number within the repository */
  number: number;
  /** Milestone title */
  title: string;
  /** Milestone description */
  description: string | null;
  /** Milestone state */
  state: 'open' | 'closed';
  /** ISO 8601 due date, if set */
  due_on: string | null;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** ISO 8601 timestamp of closing */
  closed_at: string | null;
  /** Number of open issues in this milestone */
  open_issues: number;
  /** Number of closed issues in this milestone */
  closed_issues: number;
}

/**
 * Represents a GitHub pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request}
 */
export interface GitHubPullRequest {
  /** Unique numeric pull request ID (global across GitHub) */
  id: number;
  /** Pull request number within the repository */
  number: number;
  /** Pull request title */
  title: string;
  /** Pull request body / description */
  body: string | null;
  /** Current state */
  state: 'open' | 'closed';
  /** Whether the pull request is locked */
  locked: boolean;
  /** Whether the pull request has been merged */
  merged: boolean;
  /** Whether the pull request can be merged (null while GitHub computes it) */
  mergeable: boolean | null;
  /** Merge strategy used (only set when merged) */
  merge_commit_sha: string | null;
  /** ISO 8601 timestamp of merging */
  merged_at: string | null;
  /** ISO 8601 timestamp of closing */
  closed_at: string | null;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** Pull request author */
  user: GitHubUser;
  /** Users assigned to this pull request */
  assignees: GitHubUser[];
  /** Requested reviewers */
  requested_reviewers: GitHubUser[];
  /** Labels applied to this pull request */
  labels: GitHubLabel[];
  /** Milestone, if any */
  milestone: GitHubMilestone | null;
  /** Source branch reference */
  head: GitHubRef;
  /** Target branch reference */
  base: GitHubRef;
  /** Whether this is a draft pull request */
  draft: boolean;
  /** URL to the pull request on GitHub */
  html_url: string;
  /** Number of commits in this pull request */
  commits: number;
  /** Number of line additions */
  additions: number;
  /** Number of line deletions */
  deletions: number;
  /** Number of changed files */
  changed_files: number;
  /** User who merged this pull request */
  merged_by: GitHubUser | null;
  /** Number of review comments */
  review_comments: number;
  /** Number of comments */
  comments: number;
}

/**
 * Request body for merging a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#merge-a-pull-request}
 */
export interface MergeData {
  /** Title for the automatic commit message */
  commit_title?: string;
  /** Extra detail for the automatic commit message */
  commit_message?: string;
  /** SHA that pull request head must match to allow the merge */
  sha?: string;
  /** Merge strategy */
  merge_method?: 'merge' | 'squash' | 'rebase';
}

/**
 * Response from merging a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#merge-a-pull-request}
 */
export interface MergeResult {
  /** The merge commit SHA */
  sha: string;
  /** Whether the pull request was merged */
  merged: boolean;
  /** Result message */
  message: string;
}

/**
 * Request body for updating a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#update-a-pull-request}
 */
export interface UpdatePullRequestData {
  /** New title */
  title?: string;
  /** New body */
  body?: string;
  /** New state */
  state?: 'open' | 'closed';
  /** New base branch name */
  base?: string;
  /** Whether maintainers can modify the pull request */
  maintainer_can_modify?: boolean;
}

/**
 * Query parameters for listing pull requests.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/pulls#list-pull-requests}
 */
export interface PullRequestsParams extends PaginationParams {
  /** Filter by state */
  state?: 'open' | 'closed' | 'all';
  /** Filter by head branch (format: `user:branch-name`) */
  head?: string;
  /** Filter by base branch name */
  base?: string;
  /** Sort field */
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  /** Sort direction */
  direction?: 'asc' | 'desc';
}
