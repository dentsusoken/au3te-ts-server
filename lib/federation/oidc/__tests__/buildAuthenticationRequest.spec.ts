import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBuildAuthenticationRequest } from '../buildAuthenticationRequest';

// Mock oauth4webapi
vi.mock('oauth4webapi', async () => {
  const actual = await vi.importActual('oauth4webapi');
  return {
    ...actual,
    calculatePKCECodeChallenge: vi.fn().mockResolvedValue('calculated-challenge'),
  };
});

describe('createBuildAuthenticationRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build authentication request URL with all parameters', async () => {
    const authorizationEndpoint = vi.fn().mockResolvedValue(new URL('https://example.com/auth'));
    const buildAuthenticationRequestScope = vi.fn().mockReturnValue(['openid', 'profile']);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const buildAuthenticationRequest = createBuildAuthenticationRequest(
      authorizationEndpoint,
      buildAuthenticationRequestScope,
      clientId,
      redirectUri
    );

    const result = await buildAuthenticationRequest('test-state', 'test-verifier', 'S256');

    expect(result.toString()).toContain('https://example.com/auth');
    expect(result.searchParams.get('response_type')).toBe('code');
    expect(result.searchParams.get('scope')).toBe('openid profile');
    expect(result.searchParams.get('client_id')).toBe('test-client-id');
    expect(result.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
    expect(result.searchParams.get('state')).toBe('test-state');
    expect(result.searchParams.get('code_challenge')).toBe('calculated-challenge');
    expect(result.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('should use plain method for code challenge when method is plain', async () => {
    const authorizationEndpoint = vi.fn().mockResolvedValue(new URL('https://example.com/auth'));
    const buildAuthenticationRequestScope = vi.fn().mockReturnValue(['openid']);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const buildAuthenticationRequest = createBuildAuthenticationRequest(
      authorizationEndpoint,
      buildAuthenticationRequestScope,
      clientId,
      redirectUri
    );

    const result = await buildAuthenticationRequest('test-state', 'test-verifier', 'plain');

    expect(result.searchParams.get('code_challenge')).toBe('test-verifier');
    expect(result.searchParams.get('code_challenge_method')).toBe('plain');
  });

  it('should not include code_challenge when verifier is not provided', async () => {
    const authorizationEndpoint = vi.fn().mockResolvedValue(new URL('https://example.com/auth'));
    const buildAuthenticationRequestScope = vi.fn().mockReturnValue(['openid']);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const buildAuthenticationRequest = createBuildAuthenticationRequest(
      authorizationEndpoint,
      buildAuthenticationRequestScope,
      clientId,
      redirectUri
    );

    const result = await buildAuthenticationRequest('test-state');

    expect(result.searchParams.has('code_challenge')).toBe(false);
    expect(result.searchParams.has('code_challenge_method')).toBe(false);
  });

  it('should handle async clientId and redirectUri', async () => {
    const authorizationEndpoint = vi.fn().mockResolvedValue(new URL('https://example.com/auth'));
    const buildAuthenticationRequestScope = vi.fn().mockReturnValue(['openid']);
    const clientId = vi.fn().mockResolvedValue('async-client-id');
    const redirectUri = vi.fn().mockResolvedValue(new URL('https://example.com/callback'));

    const buildAuthenticationRequest = createBuildAuthenticationRequest(
      authorizationEndpoint,
      buildAuthenticationRequestScope,
      clientId,
      redirectUri
    );

    const result = await buildAuthenticationRequest('test-state');

    expect(result.searchParams.get('client_id')).toBe('async-client-id');
    expect(result.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
  });

  it('should filter out null parameters', async () => {
    const authorizationEndpoint = vi.fn().mockResolvedValue(new URL('https://example.com/auth'));
    const buildAuthenticationRequestScope = vi.fn().mockReturnValue(['openid']);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const buildAuthenticationRequest = createBuildAuthenticationRequest(
      authorizationEndpoint,
      buildAuthenticationRequestScope,
      clientId,
      redirectUri
    );

    const result = await buildAuthenticationRequest('test-state');

    // Should not contain code_challenge or code_challenge_method
    expect(result.searchParams.has('code_challenge')).toBe(false);
    expect(result.searchParams.has('code_challenge_method')).toBe(false);
  });
});

