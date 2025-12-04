import { describe, it, expect, vi } from 'vitest';
import { createCreateFederationRequest } from '../createFederationRequest';
import { BuildAuthenticationRequest } from '../buildAuthenticationRequest';

describe('createCreateFederationRequest', () => {
  it('should create federation request with state and codeVerifier', async () => {
    const mockUrl = new URL('https://example.com/auth?state=test-state&code_challenge=challenge');
    const buildAuthenticationRequest: BuildAuthenticationRequest = vi.fn().mockResolvedValue(mockUrl);

    const createFederationRequest = createCreateFederationRequest(buildAuthenticationRequest);

    const result = await createFederationRequest('test-state', 'test-verifier');

    expect(result).toBe(mockUrl);
    expect(buildAuthenticationRequest).toHaveBeenCalledWith(
      'test-state',
      'test-verifier',
      'S256'
    );
  });

  it('should create federation request with state only', async () => {
    const mockUrl = new URL('https://example.com/auth?state=test-state');
    const buildAuthenticationRequest: BuildAuthenticationRequest = vi.fn().mockResolvedValue(mockUrl);

    const createFederationRequest = createCreateFederationRequest(buildAuthenticationRequest);

    const result = await createFederationRequest('test-state');

    expect(result).toBe(mockUrl);
    expect(buildAuthenticationRequest).toHaveBeenCalledWith(
      'test-state',
      undefined,
      undefined
    );
  });

  it('should use S256 method when codeVerifier is provided', async () => {
    const mockUrl = new URL('https://example.com/auth');
    const buildAuthenticationRequest: BuildAuthenticationRequest = vi.fn().mockResolvedValue(mockUrl);

    const createFederationRequest = createCreateFederationRequest(buildAuthenticationRequest);

    await createFederationRequest('test-state', 'test-verifier');

    expect(buildAuthenticationRequest).toHaveBeenCalledWith(
      'test-state',
      'test-verifier',
      'S256'
    );
  });
});

