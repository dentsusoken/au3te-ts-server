import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMakeUserInfoRequest } from '../makeUserInfoRequest';
import { GetServerMetadata } from '../getServerMetadata';

// Mock oauth4webapi
vi.mock('oauth4webapi', async () => {
  const actual = await vi.importActual('oauth4webapi');
  return {
    ...actual,
    userInfoRequest: vi.fn(),
    processUserInfoResponse: vi.fn(),
    skipSubjectCheck: Symbol('skipSubjectCheck'),
    allowInsecureRequests: Symbol('allowInsecureRequests'),
  };
});

describe('createMakeUserInfoRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make user info request with access token', async () => {
    const { userInfoRequest, processUserInfoResponse } = await import('oauth4webapi');

    const mockServerMetadata = {
      userinfo_endpoint: 'https://example.com/userinfo',
    };
    const mockResponse = new Response(JSON.stringify({ sub: 'user-123' }), {
      status: 200,
    });
    const mockUserInfo = {
      sub: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    vi.mocked(userInfoRequest).mockResolvedValue(mockResponse);
    vi.mocked(processUserInfoResponse).mockResolvedValue(mockUserInfo as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const makeUserInfoRequest = createMakeUserInfoRequest(getServerMetadata, clientId, false);

    const result = await makeUserInfoRequest('access-token-123', 'user-123');

    expect(getServerMetadata).toHaveBeenCalled();
    expect(userInfoRequest).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      'access-token-123',
      expect.any(Object)
    );
    expect(processUserInfoResponse).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      'user-123',
      mockResponse
    );
    expect(result).toEqual(mockUserInfo);
  });

  it('should use skipSubjectCheck when expectedSubject is not provided', async () => {
    const { userInfoRequest, processUserInfoResponse, skipSubjectCheck } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      userinfo_endpoint: 'https://example.com/userinfo',
    };
    const mockResponse = new Response(JSON.stringify({ sub: 'user-123' }), {
      status: 200,
    });
    const mockUserInfo = {
      sub: 'user-123',
      name: 'Test User',
    };

    vi.mocked(userInfoRequest).mockResolvedValue(mockResponse);
    vi.mocked(processUserInfoResponse).mockResolvedValue(mockUserInfo as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const makeUserInfoRequest = createMakeUserInfoRequest(getServerMetadata, clientId, false);

    await makeUserInfoRequest('access-token-123');

    expect(processUserInfoResponse).toHaveBeenCalledWith(
      mockServerMetadata,
      { client_id: 'test-client-id' },
      skipSubjectCheck,
      mockResponse
    );
  });

  it('should use isDev flag for allowInsecureRequests', async () => {
    const { userInfoRequest, processUserInfoResponse, allowInsecureRequests } =
      await import('oauth4webapi');

    const mockServerMetadata = {
      userinfo_endpoint: 'https://example.com/userinfo',
    };
    const mockResponse = new Response(JSON.stringify({ sub: 'user-123' }), {
      status: 200,
    });
    const mockUserInfo = {
      sub: 'user-123',
    };

    vi.mocked(userInfoRequest).mockResolvedValue(mockResponse);
    vi.mocked(processUserInfoResponse).mockResolvedValue(mockUserInfo as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const makeUserInfoRequest = createMakeUserInfoRequest(getServerMetadata, clientId, true);

    await makeUserInfoRequest('access-token-123');

    expect(userInfoRequest).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(String),
      expect.objectContaining({
        [allowInsecureRequests]: true,
      })
    );
  });

  it('should pass through options to userInfoRequest', async () => {
    const { userInfoRequest, processUserInfoResponse } = await import('oauth4webapi');

    const mockServerMetadata = {
      userinfo_endpoint: 'https://example.com/userinfo',
    };
    const mockResponse = new Response(JSON.stringify({ sub: 'user-123' }), {
      status: 200,
    });
    const mockUserInfo = {
      sub: 'user-123',
    };

    vi.mocked(userInfoRequest).mockResolvedValue(mockResponse);
    vi.mocked(processUserInfoResponse).mockResolvedValue(mockUserInfo as any);

    const getServerMetadata: GetServerMetadata = vi.fn().mockResolvedValue(mockServerMetadata as any);
    const clientId = vi.fn().mockReturnValue('test-client-id');

    const makeUserInfoRequest = createMakeUserInfoRequest(getServerMetadata, clientId, false);

    const options = { signal: new AbortController().signal };
    await makeUserInfoRequest('access-token-123', 'user-123', options);

    expect(userInfoRequest).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(String),
      expect.objectContaining(options)
    );
  });
});

