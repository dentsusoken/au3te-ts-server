import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessOidcRequest } from '../processOidcRequest';
import { OidcFederation } from '@/federation/oidc/OidcFederation';
import { DefaultSessionSchemas, Session } from '@/session';
import { ResponseErrorFactory } from '../../core';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

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

    const mockUserHandler = {
      addUser: vi.fn(),
    } as unknown as UserHandlerConfiguration<User>;

    const mockResponseErrorFactory: ResponseErrorFactory = {
      badRequestResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 400 }),
      })),
      internalServerErrorResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 500 }),
      })),
    } as unknown as ResponseErrorFactory;

    const mockFederation: OidcFederation = {
      id: 'test-federation',
      type: 'oidc',
      processFederationResponse: vi.fn(),
    } as unknown as OidcFederation;

    return {
      mockSession,
      mockUserHandler,
      mockResponseErrorFactory,
      mockFederation,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful processing', () => {
    // Given: Valid session with federationCallbackParams and authorizationPageModel
    // When: Processing OIDC request
    // Then: Returns authorization page with user info
    it('should process OIDC request successfully and return authorization page', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      const mockUserInfo = {
        sub: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      };

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'federationCallbackParams') {
            return Promise.resolve({
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
        }
      );

      (mockFederation.processFederationResponse as ReturnType<
        typeof vi.fn
      >).mockResolvedValue(mockUserInfo);

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request(
        'https://example.com/callback?code=auth-code&state=test-state'
      );
      const response = await processOidcRequest(request, mockFederation);

      expect(mockFederation.processFederationResponse).toHaveBeenCalledWith(
        expect.any(URL),
        'test-state',
        'test-verifier'
      );
      expect(mockSession.setBatch).toHaveBeenCalledWith({
        user: expect.objectContaining({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'user123@test-federation',
        }),
        authTime: expect.any(Number),
      });
      expect(mockUserHandler.addUser).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('error handling', () => {
    // Given: Session without federationCallbackParams
    // When: Processing OIDC request
    // Then: Returns 400 error
    it('should return 400 when federationCallbackParams not found', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processOidcRequest(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith('Federation parameters not found');
    });

    // Given: Session without authorizationPageModel
    // When: Processing OIDC request
    // Then: Returns 400 error
    it('should return 400 when authorizationPageModel not found', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'federationCallbackParams') {
            return Promise.resolve({
              state: 'test-state',
              codeVerifier: 'test-verifier',
            });
          }
          return Promise.resolve(null);
        }
      );

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processOidcRequest(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith('Authorization page model not found');
    });

    // Given: Session without state in federationCallbackParams
    // When: Processing OIDC request
    // Then: Returns 400 error
    it('should return 400 when state not found in federationCallbackParams', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'federationCallbackParams') {
            return Promise.resolve({
              codeVerifier: 'test-verifier',
            });
          }
          if (key === 'authorizationPageModel') {
            return Promise.resolve({
              user: null,
            });
          }
          return Promise.resolve(null);
        }
      );

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processOidcRequest(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith('State not found');
    });

    // Given: Federation response processing fails
    // When: Processing OIDC request
    // Then: Returns 400 error
    it('should return 400 when federation response processing fails', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'federationCallbackParams') {
            return Promise.resolve({
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
        }
      );

      (mockFederation.processFederationResponse as ReturnType<
        typeof vi.fn
      >).mockRejectedValue(new Error('Federation error'));

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processOidcRequest(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith('Failed to process federation response: Federation error');
    });

    // Given: Unexpected error occurs
    // When: Processing OIDC request
    // Then: Returns 500 error
    it('should return 500 when unexpected error occurs', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Unexpected error')
      );

      const processOidcRequest = createProcessOidcRequest({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processOidcRequest(request, mockFederation);

      expect(response.status).toBe(500);
      expect(
        mockResponseErrorFactory.internalServerErrorResponseError
      ).toHaveBeenCalledWith('Unexpected error: Unexpected error');
    });
  });
});
