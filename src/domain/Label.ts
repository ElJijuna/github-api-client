import type { PaginationParams } from './Pagination';

/**
 * Query parameters for listing labels.
 *
 * @see {@link https://docs.github.com/en/rest/issues/labels#list-labels-for-a-repository}
 */
export interface LabelsParams extends PaginationParams {}

/**
 * Request body for creating a label.
 *
 * @see {@link https://docs.github.com/en/rest/issues/labels#create-a-label}
 */
export interface CreateLabelData {
  /** Label name (required) */
  name: string;
  /** Hex color code without `#` (e.g., `'f29513'`) */
  color: string;
  /** Label description */
  description?: string;
}

/**
 * Request body for updating a label.
 *
 * @see {@link https://docs.github.com/en/rest/issues/labels#update-a-label}
 */
export interface UpdateLabelData {
  /** New label name */
  name?: string;
  /** New hex color code without `#` */
  color?: string;
  /** New description */
  description?: string;
}
