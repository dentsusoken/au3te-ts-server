import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFromServerMetadata } from '../fromServerMetadata';
import { AuthorizationServer } from 'oauth4webapi';
import { GetServerMetadata } from '../getServerMetadata';

describe('createFromServerMetadata', () => {
  const createMockServerMetadata = (): AuthorizationServer => ({
    issuer: 'https://example.com',
    authorization_endpoint: 'https://example.com/auth',
    token_endpoint: 'https://example.com/token',
    userinfo_endpoint: 'https://example.com/userinfo',
    jwks_uri: 'https://example.com/jwks',
    authorization_response_iss_parameter_supported: true,
  } as AuthorizationServer);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return value from cached serverMetadata', async () => {
    const mockMetadata = createMockServerMetadata();
    const getServerMetadata: GetServerMetadata = vi.fn();
    const setServerMetadata = vi.fn();

    const fromServerMetadata = createFromServerMetadata(
      mockMetadata,
      getServerMetadata,
      setServerMetadata
    );

    const result = await fromServerMetadata('authorization_endpoint', true);

    expect(result).toBe('https://example.com/auth');
    expect(getServerMetadata).not.toHaveBeenCalled();
    expect(setServerMetadata).not.toHaveBeenCalled();
  });

  it('should fetch serverMetadata if not cached', async () => {
    const mockMetadata = createMockServerMetadata();
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockMetadata);
    const setServerMetadata = vi.fn();

    const fromServerMetadata = createFromServerMetadata(
      undefined,
      getServerMetadata,
      setServerMetadata
    );

    const result = await fromServerMetadata('token_endpoint', true);

    expect(getServerMetadata).toHaveBeenCalled();
    expect(setServerMetadata).toHaveBeenCalledWith(mockMetadata);
    expect(result).toBe('https://example.com/token');
  });

  it('should return all supported metadata fields', async () => {
    const mockMetadata = createMockServerMetadata();
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockMetadata);

    const fromServerMetadata = createFromServerMetadata(
      mockMetadata,
      getServerMetadata
    );

    expect(await fromServerMetadata('authorization_endpoint', true)).toBe(
      'https://example.com/auth'
    );
    expect(await fromServerMetadata('token_endpoint', true)).toBe('https://example.com/token');
    expect(await fromServerMetadata('userinfo_endpoint', true)).toBe(
      'https://example.com/userinfo'
    );
    expect(await fromServerMetadata('jwks_uri', true)).toBe('https://example.com/jwks');
    expect(await fromServerMetadata('authorization_response_iss_parameter_supported', false)).toBe(
      true
    );
  });

  it('should throw error for required field that is missing', async () => {
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
    } as AuthorizationServer;
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockMetadata);

    const fromServerMetadata = createFromServerMetadata(mockMetadata, getServerMetadata);

    await expect(
      fromServerMetadata('authorization_endpoint', true)
    ).rejects.toThrow("'authorization_endpoint' is not found in server metadata");
  });

  it('should return undefined for optional field that is missing', async () => {
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
    } as AuthorizationServer;
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockMetadata);

    const fromServerMetadata = createFromServerMetadata(mockMetadata, getServerMetadata);

    const result = await fromServerMetadata('authorization_endpoint', false);

    expect(result).toBeUndefined();
  });
});

