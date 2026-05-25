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
 * A repository and the number of contributions a user made to it in a period.
 */
export interface RepoContribution {
  /** Repository info */
  repository: {
    /** Full name including owner, e.g. `'octocat/Hello-World'` */
    nameWithOwner: string;
    /** URL to the repository on GitHub */
    url: string;
  };
  /** Total number of contributions to this repository */
  totalCount: number;
}

/**
 * A pinned repository on a user's GitHub profile.
 */
export interface PinnedRepository {
  /** Full name including owner, e.g. `'octocat/Hello-World'` */
  nameWithOwner: string;
  /** Repository description */
  description: string | null;
  /** URL to the repository on GitHub */
  url: string;
  /** Number of stars */
  stargazerCount: number;
  /** Primary programming language, or null if none detected */
  primaryLanguage: { name: string } | null;
}

/**
 * A pinned gist on a user's GitHub profile.
 */
export interface PinnedGist {
  /** Gist short ID */
  name: string;
  /** Gist description */
  description: string | null;
  /** URL to the gist on GitHub */
  url: string;
}

/**
 * A pinned item — either a repository or a gist.
 * Discriminate with `'nameWithOwner' in item` (repository) or `'name' in item` (gist).
 */
export type PinnedItem = PinnedRepository | PinnedGist;

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
