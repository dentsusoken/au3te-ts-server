import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessRequest } from '../processRequest';
import { ExtractPathParameter } from '@/extractor/extractPathParameter';
import { FederationManager } from '@/federation/FederationManager';
import { DefaultSessionSchemas, Session } from '@/session';
import { ResponseErrorFactory } from '../../core';

describe('createProcessRequest (federation-callback)', () => {
  const createMockDependencies = () => {
    const mockSession = {
      get: vi.fn(),
      getBatch: vi.fn(),
      set: vi.fn(),
      setBatch: vi.fn(),
      delete: vi.fn(),
      deleteBatch: vi.fn(),
      clear: vi.fn(),
    } as unknown as Session<DefaultSessionSchemas>;

    const mockExtractPathParameter: ExtractPathParameter = vi.fn(
      (request: Request, pattern: string) => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const patternParts = pattern.split('/');
        const params: Record<string, string> = {};

        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(':')) {
            params[patternParts[i].slice(1)] = pathParts[i];
          }
        }
        return params;
      }
    );

    const mockUserInfo = {
      sub: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    };

    const mockFederation = {
      processFederationResponse: vi.fn().mockResolvedValue(mockUserInfo),
    };

    const mockFederationManager = {
      getFederation: vi.fn((id: string) => {
        if (id === 'test-federation') {
          return mockFederation;
        }
        throw new Error(`Federation with ID '${id}' not found`);
      }),
    } as unknown as FederationManager;

    const mockResponseErrorFactory: ResponseErrorFactory = {
      notFoundResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 404 }),
      })),
      badRequestResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 400 }),
      })),
      internalServerErrorResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 500 }),
      })),
    } as unknown as ResponseErrorFactory;

    return {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
      mockUserInfo,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process request successfully and return authorization page', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
      mockUserInfo,
    } = createMockDependencies();

    (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation((key: keyof DefaultSessionSchemas) => {
      if (key === 'federationCallbackParams') {
        return Promise.resolve({
          protocol: 'oidc',
          state: 'test-state',
          codeVerifier: 'test-verifier',
        });
      }
      if (key === 'authorizationPageModel') {
        return Promise.resolve({
          user: null,
        });
      }
      return Promise.resolve(null);
    });

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(mockExtractPathParameter).toHaveBeenCalledWith(
      request,
      '/api/federation/callback/:federationId'
    );
    expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
      'test-federation'
    );
    expect(mockFederation.processFederationResponse).toHaveBeenCalledWith(
      expect.any(URL),
      'test-state',
      'test-verifier'
    );
    expect(mockSession.setBatch).toHaveBeenCalledWith({
      user: expect.objectContaining({
        ...mockUserInfo,
        subject: `${mockUserInfo.sub}@test-federation`,
      }),
      authTime: expect.any(Number),
    });
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.user).toEqual({
      ...mockUserInfo,
      subject: `${mockUserInfo.sub}@test-federation`,
    });
  });

  it('should return 404 for unknown federation ID', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
    } = createMockDependencies();

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/unknown-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(404);
    expect(mockResponseErrorFactory.notFoundResponseError).toHaveBeenCalledWith(
      "Federation with ID 'unknown-federation' not found"
    );
  });

  it('should return 400 when federationCallbackParams not found', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
    } = createMockDependencies();

    (mockSession.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(400);
    expect(
      mockResponseErrorFactory.badRequestResponseError
    ).toHaveBeenCalledWith('Federation parameters not found');
  });

  it('should return 400 when authorizationPageModel not found', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
    } = createMockDependencies();

    (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation((key: keyof DefaultSessionSchemas) => {
      if (key === 'federationCallbackParams') {
        return Promise.resolve({
          protocol: 'oidc',
          state: 'test-state',
          codeVerifier: 'test-verifier',
        });
      }
      return Promise.resolve(null);
    });

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(400);
    expect(
      mockResponseErrorFactory.badRequestResponseError
    ).toHaveBeenCalledWith('Authorization page model not found');
  });

  it('should return 400 when state not found in federationCallbackParams', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
    } = createMockDependencies();

    (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation((key: keyof DefaultSessionSchemas) => {
      if (key === 'federationCallbackParams') {
        return Promise.resolve({
          protocol: 'oidc',
          codeVerifier: 'test-verifier',
        });
      }
      if (key === 'authorizationPageModel') {
        return Promise.resolve({
          user: null,
        });
      }
      return Promise.resolve(null);
    });

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(400);
    expect(
      mockResponseErrorFactory.badRequestResponseError
    ).toHaveBeenCalledWith('State not found');
  });

  it('should handle federation response processing error', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
    } = createMockDependencies();

    (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation((key: keyof DefaultSessionSchemas) => {
      if (key === 'federationCallbackParams') {
        return Promise.resolve({
          protocol: 'oidc',
          state: 'test-state',
          codeVerifier: 'test-verifier',
        });
      }
      if (key === 'authorizationPageModel') {
        return Promise.resolve({
          user: null,
        });
      }
      return Promise.resolve(null);
    });

    mockFederation.processFederationResponse.mockRejectedValue(
      new Error('Failed to process federation response')
    );

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(400);
    expect(
      mockResponseErrorFactory.badRequestResponseError
    ).toHaveBeenCalledWith(
      'Failed to process federation response: Failed to process federation response'
    );
  });

  it('should handle unexpected errors', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
    } = createMockDependencies();

    (mockExtractPathParameter as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const processRequest = createProcessRequest({
      path: '/api/federation/callback/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(500);
    expect(
      mockResponseErrorFactory.internalServerErrorResponseError
    ).toHaveBeenCalledWith('Unexpected error: Unexpected error');
  });
});
