import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createExtractAuthorizationCode } from '../extractAuthorizationCode';
import { GetServerMetadata } from '../getServerMetadata';

// Mock oauth4webapi
vi.mock('oauth4webapi', async () => {
  const actual = await vi.importActual('oauth4webapi');
  return {
    ...actual,
    validateAuthResponse: vi.fn(),
  };
});

describe('createExtractAuthorizationCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract authorization code from response URL', async () => {
    const { validateAuthResponse } = await import('oauth4webapi');
    const mockSearchParams = new URLSearchParams({
      code: 'auth-code-123',
      state: 'test-state',
    });

    vi.mocked(validateAuthResponse).mockResolvedValue(mockSearchParams);

    const mockServerMetadata = {
      issuer: 'https://example.com',
    };
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const extractAuthorizationCode = createExtractAuthorizationCode(getServerMetadata, clientId);

    const responseUrl = new URL('https://example.com/callback?code=auth-code-123&state=test-state');
    const result = await extractAuthorizationCode(responseUrl, 'test-state');

    expect(getServerMetadata).toHaveBeenCalled();
    expect(validateAuthResponse).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      responseUrl.searchParams,
      'test-state'
    );
    expect(result.get('code')).toBe('auth-code-123');
    expect(result.get('state')).toBe('test-state');
  });

  it('should work without state parameter', async () => {
    const { validateAuthResponse } = await import('oauth4webapi');
    const mockSearchParams = new URLSearchParams({
      code: 'auth-code-123',
    });

    vi.mocked(validateAuthResponse).mockResolvedValue(mockSearchParams);

    const mockServerMetadata = {
      issuer: 'https://example.com',
    };
    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const extractAuthorizationCode = createExtractAuthorizationCode(getServerMetadata, clientId);

    const responseUrl = new URL('https://example.com/callback?code=auth-code-123');
    const result = await extractAuthorizationCode(responseUrl);

    expect(validateAuthResponse).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      responseUrl.searchParams,
      undefined
    );
    expect(result.get('code')).toBe('auth-code-123');
  });
});

