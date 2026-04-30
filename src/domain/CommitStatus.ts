import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';
import type { GitHubRepository } from './Repository';

/**
 * Represents an individual commit status set by a CI/CD system or external service.
 *
 * @see {@link https://docs.github.com/en/rest/commits/statuses#list-commit-statuses-for-a-reference}
 */
export interface GitHubCommitStatus {
  /** Unique numeric status ID */
  id: number;
  /** Status state */
  state: 'error' | 'failure' | 'pending' | 'success';
  /** Human-readable description */
  description: string | null;
  /** URL to the full details of the status */
  target_url: string | null;
  /** Context label identifying the source (e.g., `'ci/circleci'`) */
  context: string;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** User who created the status */
  creator: GitHubUser;
}

/**
 * Represents the combined commit status — an aggregation of all statuses for a ref.
 *
 * @see {@link https://docs.github.com/en/rest/commits/statuses#get-the-combined-status-for-a-specific-reference}
 */
export interface GitHubCombinedStatus {
  /** Overall combined state */
  state: 'error' | 'failure' | 'pending' | 'success';
  /** Individual statuses that make up the combined status */
  statuses: GitHubCommitStatus[];
  /** The commit SHA this status refers to */
  sha: string;
  /** Total number of statuses */
  total_count: number;
  /** The repository this status belongs to */
  repository: GitHubRepository;
}

/**
 * Represents a GitHub Actions check run.
 *
 * @see {@link https://docs.github.com/en/rest/checks/runs#get-a-check-run}
 */
export interface GitHubCheckRun {
  /** Unique numeric check run ID */
  id: number;
  /** Check run name */
  name: string;
  /** Current status */
  status: 'queued' | 'in_progress' | 'completed';
  /** Conclusion (only set when `status` is `'completed'`) */
  conclusion: 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'success' | 'skipped' | 'stale' | 'timed_out' | null;
  /** ISO 8601 timestamp of when the check started */
  started_at: string | null;
  /** ISO 8601 timestamp of when the check completed */
  completed_at: string | null;
  /** URL to the check run details on GitHub */
  html_url: string;
  /** The commit SHA this check run is for */
  head_sha: string;
  /** GitHub App that created the check run */
  app: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * Query parameters for listing commit statuses.
 *
 * @see {@link https://docs.github.com/en/rest/commits/statuses#list-commit-statuses-for-a-reference}
 */
export interface CommitStatusesParams extends PaginationParams {}

/**
 * Query parameters for listing check runs.
 *
 * @see {@link https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference}
 */
export interface CheckRunsParams extends PaginationParams {
  /** Filter by check name */
  check_name?: string;
  /** Filter by status */
  status?: 'queued' | 'in_progress' | 'completed';
  /** Filter by app slug */
  app_id?: number;
}

/**
 * Request body for creating a commit status.
 *
 * @see {@link https://docs.github.com/en/rest/commits/statuses#create-a-commit-status}
 */
export interface CreateStatusData {
  /** The state of the status */
  state: 'error' | 'failure' | 'pending' | 'success';
  /** URL to associate with this status */
  target_url?: string;
  /** Short description of the status */
  description?: string;
  /** Label identifying the status source (e.g., `'ci/circleci'`) */
  context?: string;
}

/**
 * Represents a comment on a commit.
 *
 * @see {@link https://docs.github.com/en/rest/commits/comments#list-commit-comments-for-a-repository}
 */
export interface GitHubCommitComment {
  /** Unique numeric comment ID */
  id: number;
  /** Comment body text */
  body: string;
  /** User who created the comment */
  user: GitHubUser;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** URL to the comment on GitHub */
  html_url: string;
  /** The commit SHA this comment belongs to */
  commit_id: string;
  /** Path of the file the comment is associated with, or `null` for general comments */
  path: string | null;
  /** Line index in the diff, or `null` for general comments */
  position: number | null;
  /** Line number in the file, or `null` for general comments */
  line: number | null;
}

/**
 * Query parameters for listing commit comments.
 *
 * @see {@link https://docs.github.com/en/rest/commits/comments#list-commit-comments}
 */
export interface CommitCommentsParams extends PaginationParams {}

/**
 * Request body for adding a commit comment.
 *
 * @see {@link https://docs.github.com/en/rest/commits/comments#create-a-commit-comment}
 */
export interface CommitCommentData {
  /** The comment body text */
  body: string;
  /** Relative path of the file to comment on */
  path?: string;
  /** Line index in the diff to comment on */
  position?: number;
  /** Line number in the file to comment on */
  line?: number;
}
