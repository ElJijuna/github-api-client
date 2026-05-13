/**
 * Represents a single day in a GitHub contribution calendar.
 */
export interface ContributionDay {
  /** ISO date string, e.g., '2024-01-15' */
  date: string;
  /** Number of contributions on this day */
  contributionCount: number;
  /** Hex color representing intensity, e.g., '#216e39' */
  color: string;
}

/**
 * The full contribution calendar returned by the GitHub GraphQL API,
 * suitable for rendering a contribution map (heatmap) chart.
 */
export interface ContributionCalendar {
  /** Total number of contributions in the queried period */
  totalContributions: number;
  /** Weeks in the calendar, each containing up to 7 contribution days */
  weeks: Array<{ contributionDays: ContributionDay[] }>;
}

/**
 * Query parameters for {@link UserResource.contributionMap}.
 */
export interface ContributionMapParams {
  /**
   * Start of the period as an ISO 8601 DateTime string.
   * Defaults to one year before `to`.
   */
  from?: string;
  /**
   * End of the period as an ISO 8601 DateTime string.
   * Defaults to the current date.
   */
  to?: string;
}
