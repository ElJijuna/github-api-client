import type { PaginationParams } from './Pagination';

/**
 * Query parameters for listing milestones.
 *
 * @see {@link https://docs.github.com/en/rest/issues/milestones#list-milestones}
 */
export interface MilestonesParams extends PaginationParams {
  /** Filter by state */
  state?: 'open' | 'closed' | 'all';
  /** Sort field */
  sort?: 'due_on' | 'completeness';
  /** Sort direction */
  direction?: 'asc' | 'desc';
}

/**
 * Request body for creating a milestone.
 *
 * @see {@link https://docs.github.com/en/rest/issues/milestones#create-a-milestone}
 */
export interface CreateMilestoneData {
  /** Milestone title (required) */
  title: string;
  /** Milestone state */
  state?: 'open' | 'closed';
  /** Milestone description */
  description?: string;
  /** ISO 8601 due date (e.g., `'2025-12-31T00:00:00Z'`) */
  due_on?: string;
}

/**
 * Request body for updating a milestone.
 *
 * @see {@link https://docs.github.com/en/rest/issues/milestones#update-a-milestone}
 */
export interface UpdateMilestoneData {
  /** New title */
  title?: string;
  /** New state */
  state?: 'open' | 'closed';
  /** New description */
  description?: string;
  /** New due date (ISO 8601) */
  due_on?: string;
}
