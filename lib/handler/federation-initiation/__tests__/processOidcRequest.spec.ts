import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessOidcRequest } from '../processOidcRequest';
import { OidcFederation } from '@/federation/oidc/OidcFederation';
import { DefaultSessionSchemas, Session } from '@/session';
import { ResponseFactory } from '../../core';

describe('createProcessOidcRequest', () => {
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

    const mockResponseFactory: ResponseFactory = {
      location: vi.fn((url: string) =>
        new Response(null, {
          status: 302,
          headers: { Location: url },
        })
      ),
    } as unknown as ResponseFactory;

    const mockFederation: OidcFederation = {
      id: 'test-federation',
      type: 'oidc',
      createFederationRequest: vi.fn(),
    } as unknown as OidcFederation;

    return {
      mockSession,
      mockResponseFactory,
      mockFederation,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful processing', () => {
    // Given: Valid federation
    // When: Processing OIDC initiation request
    // Then: Returns redirect response with authentication URL
    it('should process OIDC initiation request and return redirect', async () => {
      const { mockSession, mockResponseFactory, mockFederation } =
        createMockDependencies();

      const mockAuthUrl = new URL(
        'https://auth-server.com/auth?state=test-state&code_challenge=challenge'
      );

      (mockFederation.createFederationRequest as ReturnType<
        typeof vi.fn
      >).mockResolvedValue(mockAuthUrl);

      const processOidcRequest = createProcessOidcRequest({
        session: mockSession,
        responseFactory: mockResponseFactory,
      });

      const response = await processOidcRequest(mockFederation);

      expect(mockSession.set).toHaveBeenCalledWith(
        'federationCallbackParams',
        expect.objectContaining({
          state: expect.any(String),
          codeVerifier: expect.any(String),
        })
      );

      const setCall = (mockSession.set as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const federationCallbackParams = setCall[1];
      const { state, codeVerifier } = federationCallbackParams;

      expect(mockFederation.createFederationRequest).toHaveBeenCalledWith(
        state,
        codeVerifier
      );
      expect(mockResponseFactory.location).toHaveBeenCalledWith(
        mockAuthUrl.toString()
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(mockAuthUrl.toString());
    });

    // Given: Valid federation
    // When: Processing OIDC initiation request
    // Then: Generates random state and codeVerifier
    it('should generate random state and codeVerifier', async () => {
      const { mockSession, mockResponseFactory, mockFederation } =
        createMockDependencies();

      const mockAuthUrl = new URL('https://auth-server.com/auth');
      (mockFederation.createFederationRequest as ReturnType<
        typeof vi.fn
      >).mockResolvedValue(mockAuthUrl);

      const processOidcRequest = createProcessOidcRequest({
        session: mockSession,
        responseFactory: mockResponseFactory,
      });

      await processOidcRequest(mockFederation);

      const setCall = (mockSession.set as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const federationCallbackParams = setCall[1];
      const { state, codeVerifier } = federationCallbackParams;

      expect(state).toBeDefined();
      expect(codeVerifier).toBeDefined();
      expect(typeof state).toBe('string');
      expect(typeof codeVerifier).toBe('string');
      expect(state.length).toBeGreaterThan(0);
      expect(codeVerifier.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    // Given: Federation createFederationRequest fails
    // When: Processing OIDC initiation request
    // Then: Error is propagated
    it('should propagate error when createFederationRequest fails', async () => {
      const { mockSession, mockResponseFactory, mockFederation } =
        createMockDependencies();

      (mockFederation.createFederationRequest as ReturnType<
        typeof vi.fn
      >).mockRejectedValue(new Error('Federation request error'));

      const processOidcRequest = createProcessOidcRequest({
        session: mockSession,
        responseFactory: mockResponseFactory,
      });

      await expect(processOidcRequest(mockFederation)).rejects.toThrow(
        'Federation request error'
      );
    });

    // Given: Session set fails
    // When: Processing OIDC initiation request
    // Then: Error is propagated
    it('should propagate error when session.set fails', async () => {
      const { mockSession, mockResponseFactory, mockFederation } =
        createMockDependencies();

      (mockSession.set as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Session error')
      );

      const processOidcRequest = createProcessOidcRequest({
        session: mockSession,
        responseFactory: mockResponseFactory,
      });

      await expect(processOidcRequest(mockFederation)).rejects.toThrow(
        'Session error'
      );
    });
  });
});
