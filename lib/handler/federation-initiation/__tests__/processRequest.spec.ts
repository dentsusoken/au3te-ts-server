import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessRequest } from '../processRequest';
import { ExtractPathParameter } from '@/extractor/extractPathParameter';
import { FederationManager } from '@/federation/FederationManager';
import { DefaultSessionSchemas, Session } from '@/session';
import { ResponseErrorFactory, ResponseFactory } from '../../core';

describe('createProcessRequest (federation-initiation)', () => {
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

    const mockFederation = {
      createFederationRequest: vi
        .fn()
        .mockResolvedValue(
          new URL(
            'https://auth-server.com/auth?state=test-state&code_challenge=challenge'
          )
        ),
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

    const mockResponseFactory: ResponseFactory = {
      location: vi.fn(
        (url: string) =>
          new Response(null, {
            status: 302,
            headers: { Location: url },
          })
      ),
    } as unknown as ResponseFactory;

    return {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
      mockResponseFactory,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process request and redirect to authentication endpoint', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
      mockResponseFactory,
    } = createMockDependencies();

    const processRequest = createProcessRequest({
      path: '/api/federation/initiation/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
      responseFactory: mockResponseFactory,
    });

    const request = new Request(
      'https://example.com/api/federation/initiation/test-federation'
    );

    const response = await processRequest(request);

    expect(mockExtractPathParameter).toHaveBeenCalledWith(
      request,
      '/api/federation/initiation/:federationId'
    );
    expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
      'test-federation'
    );
    expect(mockSession.set).toHaveBeenCalledWith(
      'federationCallbackParams',
      expect.objectContaining({
        state: expect.any(String),
        codeVerifier: expect.any(String),
      })
    );
    expect(mockFederation.createFederationRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(mockResponseFactory.location).toHaveBeenCalledWith(
      'https://auth-server.com/auth?state=test-state&code_challenge=challenge'
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(
      'https://auth-server.com/auth?state=test-state&code_challenge=challenge'
    );
  });

  it('should generate random state and codeVerifier', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
      mockResponseFactory,
    } = createMockDependencies();

    const processRequest = createProcessRequest({
      path: '/api/federation/initiation/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
      responseFactory: mockResponseFactory,
    });

    const request = new Request(
      'https://example.com/api/federation/initiation/test-federation'
    );

    await processRequest(request);

    const setCall = (mockSession.set as ReturnType<typeof vi.fn>).mock.calls.find(
      (call) => call[0] === 'federationCallbackParams'
    );
    expect(setCall).toBeDefined();
    const federationCallbackParams = setCall?.[1];
    expect(federationCallbackParams.state).toBeDefined();
    expect(federationCallbackParams.codeVerifier).toBeDefined();
    expect(typeof federationCallbackParams.state).toBe('string');
    expect(typeof federationCallbackParams.codeVerifier).toBe('string');
    expect(federationCallbackParams.state.length).toBeGreaterThan(0);
    expect(federationCallbackParams.codeVerifier.length).toBeGreaterThan(0);
  });

  it('should return 404 for unknown federation ID', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
      mockResponseFactory,
    } = createMockDependencies();

    const processRequest = createProcessRequest({
      path: '/api/federation/initiation/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
      responseFactory: mockResponseFactory,
    });

    const request = new Request(
      'https://example.com/api/federation/initiation/unknown-federation'
    );

    const response = await processRequest(request);

    expect(response.status).toBe(404);
    expect(mockResponseErrorFactory.notFoundResponseError).toHaveBeenCalledWith(
      "Federation with ID 'unknown-federation' not found"
    );
    expect(mockSession.set).not.toHaveBeenCalled();
    expect(mockResponseFactory.location).not.toHaveBeenCalled();
  });

  it('should pass generated state and codeVerifier to createFederationRequest', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockFederation,
      mockResponseErrorFactory,
      mockResponseFactory,
    } = createMockDependencies();

    const processRequest = createProcessRequest({
      path: '/api/federation/initiation/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
      responseFactory: mockResponseFactory,
    });

    const request = new Request(
      'https://example.com/api/federation/initiation/test-federation'
    );

    await processRequest(request);

    const setCall = (mockSession.set as ReturnType<typeof vi.fn>).mock.calls.find(
      (call) => call[0] === 'federationCallbackParams'
    );
    const federationCallbackParams = setCall?.[1];
    const { state, codeVerifier } = federationCallbackParams;

    expect(mockFederation.createFederationRequest).toHaveBeenCalledWith(
      state,
      codeVerifier
    );
  });

  it('should throw error when extractPathParameter fails', async () => {
    const {
      mockSession,
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
      mockResponseFactory,
    } = createMockDependencies();

    (mockExtractPathParameter as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const processRequest = createProcessRequest({
      path: '/api/federation/initiation/:federationId',
      extractPathParameter: mockExtractPathParameter,
      federationManager: mockFederationManager,
      responseErrorFactory: mockResponseErrorFactory,
      session: mockSession,
      responseFactory: mockResponseFactory,
    });

    const request = new Request(
      'https://example.com/api/federation/initiation/test-federation'
    );

    await expect(processRequest(request)).rejects.toThrow('Unexpected error');
  });
});
