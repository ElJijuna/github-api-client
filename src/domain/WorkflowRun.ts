import type { PaginationParams } from './Pagination';

/**
 * Possible status values of a GitHub Actions workflow run.
 */
export type WorkflowRunStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'waiting'
  | 'requested'
  | 'pending';

/**
 * Possible conclusion values of a completed workflow run.
 * `null` when the run is still in progress.
 */
export type WorkflowRunConclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'action_required'
  | 'stale'
  | null;

/**
 * Represents a single GitHub Actions workflow run.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run}
 */
export interface GitHubWorkflowRun {
  /** Unique numeric ID of this workflow run */
  id: number;
  /** Name of the workflow */
  name: string | null;
  /** Sequential run number for the workflow */
  run_number: number;
  /** Current status of the run */
  status: WorkflowRunStatus;
  /** Final conclusion of the run (null if still running) */
  conclusion: WorkflowRunConclusion;
  /** The branch the run was triggered on */
  head_branch: string | null;
  /** The commit SHA that triggered the run */
  head_sha: string;
  /** Name of the event that triggered the run (e.g., `'push'`, `'pull_request'`) */
  event: string;
  /** URL to view the run on GitHub */
  html_url: string;
  /** ISO 8601 timestamp of when the run was created */
  created_at: string;
  /** ISO 8601 timestamp of when the run was last updated */
  updated_at: string;
  /** ISO 8601 timestamp of when the run started executing */
  run_started_at: string | null;
}

/**
 * API response envelope for listing workflow runs.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-repository}
 */
export interface GitHubWorkflowRunsResponse {
  /** Total number of workflow runs matching the query */
  total_count: number;
  /** The workflow runs on the current page */
  workflow_runs: GitHubWorkflowRun[];
}

/**
 * Query parameters for listing workflow runs.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-repository}
 */
export interface WorkflowRunsParams extends PaginationParams {
  /** Filter by branch name */
  branch?: string;
  /** Filter by the triggering event (e.g., `'push'`, `'pull_request'`) */
  event?: string;
  /** Filter by run status */
  status?: WorkflowRunStatus | WorkflowRunConclusion;
  /** Only return runs created after this ISO 8601 date */
  created?: string;
  /** Filter by actor (user login) who triggered the run */
  actor?: string;
}
