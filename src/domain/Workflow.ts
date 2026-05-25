import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub Actions workflow definition.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflows#get-a-workflow}
 */
export interface GitHubWorkflow {
  /** Unique numeric workflow ID */
  id: number;
  /** Workflow name */
  name: string;
  /** Path to the workflow file (e.g., `.github/workflows/ci.yml`) */
  path: string;
  /** Workflow state */
  state: 'active' | 'deleted' | 'disabled_fork' | 'disabled_inactivity' | 'disabled_manually';
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** URL to the workflow on GitHub */
  html_url: string;
  /** Badge URL for the workflow status */
  badge_url: string;
}

/**
 * Query parameters for listing workflows.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflows#list-repository-workflows}
 */
export interface WorkflowsParams extends PaginationParams {}

/**
 * Request body for triggering a workflow dispatch event.
 *
 * @see {@link https://docs.github.com/en/rest/actions/workflow-runs#create-a-workflow-dispatch-event}
 */
export interface TriggerWorkflowData {
  /** The branch or tag name to trigger the workflow on (required) */
  ref: string;
  /** Input keys and values for the workflow (must be defined in the workflow `on.workflow_dispatch.inputs`) */
  inputs?: Record<string, string>;
}

/**
 * API response envelope for listing workflows.
 */
export interface GitHubWorkflowsResponse {
  /** Total number of workflows */
  total_count: number;
  /** The workflows */
  workflows: GitHubWorkflow[];
}
