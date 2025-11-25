import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMakeTokenRequest } from '../makeTokenRequest';
import { GetServerMetadata } from '../getServerMetadata';

// Mock oauth4webapi
vi.mock('oauth4webapi', async () => {
  const actual = await vi.importActual('oauth4webapi');
  return {
    ...actual,
    authorizationCodeGrantRequest: vi.fn(),
    processAuthorizationCodeResponse: vi.fn(),
    ClientSecretBasic: vi.fn((secret: string) => ({ type: 'basic', secret })),
    None: vi.fn(() => ({ type: 'none' })),
    nopkce: Symbol('nopkce'),
    allowInsecureRequests: Symbol('allowInsecureRequests'),
  };
});

describe('createMakeTokenRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make token request with client secret', async () => {
    const { authorizationCodeGrantRequest, processAuthorizationCodeResponse, ClientSecretBasic } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      token_endpoint: 'https://example.com/token',
    };
    const mockResponse = new Response(JSON.stringify({ access_token: 'token' }), {
      status: 200,
    });
    const mockTokenResponse = {
      access_token: 'access-token-123',
      id_token: 'id-token-123',
    };

    vi.mocked(authorizationCodeGrantRequest).mockResolvedValue(mockResponse);
    vi.mocked(processAuthorizationCodeResponse).mockResolvedValue(mockTokenResponse as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const clientSecret = vi.fn().mockReturnValue('test-client-secret');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const makeTokenRequest = createMakeTokenRequest(
      getServerMetadata,
      clientId,
      clientSecret,
      redirectUri,
      false
    );

    const callbackParams = new URLSearchParams({ code: 'auth-code' });
    const result = await makeTokenRequest(callbackParams, 'code-verifier');

    expect(getServerMetadata).toHaveBeenCalled();
    expect(authorizationCodeGrantRequest).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      ClientSecretBasic('test-client-secret'),
      callbackParams,
      'https://example.com/callback',
      'code-verifier',
      expect.any(Object)
    );
    expect(processAuthorizationCodeResponse).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      mockResponse,
      { requireIdToken: true }
    );
    expect(result).toEqual(mockTokenResponse);
  });

  it('should make token request without client secret', async () => {
    const { authorizationCodeGrantRequest, processAuthorizationCodeResponse, None } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      token_endpoint: 'https://example.com/token',
    };
    const mockResponse = new Response(JSON.stringify({ access_token: 'token' }), {
      status: 200,
    });
    const mockTokenResponse = {
      access_token: 'access-token-123',
    };

    vi.mocked(authorizationCodeGrantRequest).mockResolvedValue(mockResponse);
    vi.mocked(processAuthorizationCodeResponse).mockResolvedValue(mockTokenResponse as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const clientSecret = vi.fn().mockReturnValue(undefined);
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const makeTokenRequest = createMakeTokenRequest(
      getServerMetadata,
      clientId,
      clientSecret,
      redirectUri,
      false
    );

    const callbackParams = new URLSearchParams({ code: 'auth-code' });
    const result = await makeTokenRequest(callbackParams);

    const { nopkce } = await import('oauth4webapi');
    expect(authorizationCodeGrantRequest).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      None(),
      callbackParams,
      'https://example.com/callback',
      nopkce,
      expect.any(Object)
    );
    expect(result).toEqual(mockTokenResponse);
  });

  it('should use isDev flag for allowInsecureRequests', async () => {
    const { authorizationCodeGrantRequest, processAuthorizationCodeResponse, allowInsecureRequests } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      token_endpoint: 'https://example.com/token',
    };
    const mockResponse = new Response(JSON.stringify({ access_token: 'token' }), {
      status: 200,
    });
    const mockTokenResponse = {
      access_token: 'access-token-123',
    };

    vi.mocked(authorizationCodeGrantRequest).mockResolvedValue(mockResponse);
    vi.mocked(processAuthorizationCodeResponse).mockResolvedValue(mockTokenResponse as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const clientSecret = vi.fn().mockReturnValue('test-client-secret');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const makeTokenRequest = createMakeTokenRequest(
      getServerMetadata,
      clientId,
      clientSecret,
      redirectUri,
      true
    );

    const { nopkce } = await import('oauth4webapi');
    const callbackParams = new URLSearchParams({ code: 'auth-code' });
    await makeTokenRequest(callbackParams);

    expect(authorizationCodeGrantRequest).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(String),
      nopkce,
      expect.objectContaining({
        [allowInsecureRequests]: true,
      })
    );
  });

  it('should pass through options to authorizationCodeGrantRequest', async () => {
    const { authorizationCodeGrantRequest, processAuthorizationCodeResponse } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      token_endpoint: 'https://example.com/token',
    };
    const mockResponse = new Response(JSON.stringify({ access_token: 'token' }), {
      status: 200,
    });
    const mockTokenResponse = {
      access_token: 'access-token-123',
    };

    vi.mocked(authorizationCodeGrantRequest).mockResolvedValue(mockResponse);
    vi.mocked(processAuthorizationCodeResponse).mockResolvedValue(mockTokenResponse as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');
    const clientSecret = vi.fn().mockReturnValue('test-client-secret');
    const redirectUri = vi.fn().mockReturnValue(new URL('https://example.com/callback'));

    const makeTokenRequest = createMakeTokenRequest(
      getServerMetadata,
      clientId,
      clientSecret,
      redirectUri,
      false
    );

    const callbackParams = new URLSearchParams({ code: 'auth-code' });
    const options = { signal: new AbortController().signal };
    await makeTokenRequest(callbackParams, 'code-verifier', options);

    expect(authorizationCodeGrantRequest).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.objectContaining(options)
    );
  });
});

