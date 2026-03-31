import { Security } from '../../src/security/Security';

describe('Security', () => {
  describe('constructor', () => {
    it('creates an instance with a valid HTTPS URL', () => {
      expect(() => new Security('ghp_token', 'https://api.github.com')).not.toThrow();
    });

    it('creates an instance with a valid HTTP URL', () => {
      expect(() => new Security('ghp_token', 'http://localhost:8080')).not.toThrow();
    });

    it('uses the default API URL when none is provided', () => {
      const security = new Security('ghp_token');
      expect(security.getApiUrl()).toBe('https://api.github.com');
    });

    it('throws TypeError for an invalid URL', () => {
      expect(() => new Security('ghp_token', 'not-a-url')).toThrow(TypeError);
      expect(() => new Security('ghp_token', 'not-a-url')).toThrow('Invalid apiUrl');
    });

    it('removes trailing slash from the API URL', () => {
      const security = new Security('ghp_token', 'https://api.github.com/');
      expect(security.getApiUrl()).toBe('https://api.github.com');
    });

    it('removes trailing slash from a custom API URL', () => {
      const security = new Security('ghp_token', 'https://github.example.com/api/v3/');
      expect(security.getApiUrl()).toBe('https://github.example.com/api/v3');
    });
  });

  describe('getApiUrl()', () => {
    it('returns the base API URL', () => {
      const security = new Security('ghp_token', 'https://api.github.com');
      expect(security.getApiUrl()).toBe('https://api.github.com');
    });
  });

  describe('getAuthorizationHeader()', () => {
    it('returns a Bearer authorization header', () => {
      const security = new Security('ghp_myToken123');
      expect(security.getAuthorizationHeader()).toBe('Bearer ghp_myToken123');
    });

    it('uses the token as-is (no encoding)', () => {
      const security = new Security('ghs_my:special/token');
      expect(security.getAuthorizationHeader()).toBe('Bearer ghs_my:special/token');
    });
  });

  describe('getHeaders()', () => {
    it('returns all required GitHub API headers', () => {
      const security = new Security('ghp_myToken');
      const headers = security.getHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer ghp_myToken',
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      });
    });

    it('includes the correct Accept header for the GitHub API', () => {
      const security = new Security('ghp_token');
      expect(security.getHeaders()['Accept']).toBe('application/vnd.github+json');
    });

    it('includes the GitHub API version header', () => {
      const security = new Security('ghp_token');
      expect(security.getHeaders()['X-GitHub-Api-Version']).toBe('2022-11-28');
    });
  });

  describe('getRawHeaders()', () => {
    it('overrides Accept to request raw file content', () => {
      const security = new Security('ghp_myToken');
      const headers = security.getRawHeaders();

      expect(headers['Accept']).toBe('application/vnd.github.raw+json');
    });

    it('preserves all other headers', () => {
      const security = new Security('ghp_myToken');
      const headers = security.getRawHeaders();

      expect(headers['Authorization']).toBe('Bearer ghp_myToken');
      expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28');
    });
  });
});
