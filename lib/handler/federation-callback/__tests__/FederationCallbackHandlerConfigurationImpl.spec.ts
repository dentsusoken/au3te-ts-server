import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederationCallbackHandlerConfigurationImpl } from '../FederationCallbackHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { FederationManager } from '@/federation/FederationManager';
import { ExtractorConfiguration } from '@/extractor/ExtractorConfiguration';
import { FEDERATION_CALLBACK_PATH } from '../FederationCallbackHandlerConfigurationImpl';
import { DefaultSessionSchemas } from '@/session';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

describe('FederationCallbackHandlerConfigurationImpl', () => {
  const createMockDependencies = () => {
    const mockSession = {
      get: vi.fn(),
      getBatch: vi.fn(),
      set: vi.fn(),
      setBatch: vi.fn(),
      delete: vi.fn(),
      deleteBatch: vi.fn(),
      clear: vi.fn(),
    };

    const mockServerHandlerConfiguration = {
      responseErrorFactory: {
        notFoundResponseError: vi.fn((message: string) => ({
          response: new Response(message, { status: 404 }),
        })),
        badRequestResponseError: vi.fn((message: string) => ({
          response: new Response(message, { status: 400 }),
        })),
        internalServerErrorResponseError: vi.fn((message: string) => ({
          response: new Response(message, { status: 500 }),
        })),
      },
      session: mockSession,
    } as unknown as ServerHandlerConfiguration<DefaultSessionSchemas>;

    const mockExtractorConfiguration = {
      extractPathParameter: vi.fn((request: Request, pattern: string) => {
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
      }),
    } as unknown as ExtractorConfiguration;

    const mockUserHandler = {
      addUser: vi.fn(),
      cacheUserAttributes: vi.fn(),
    } as unknown as UserHandlerConfiguration<User>;

    const mockUserInfo = {
      sub: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    };

    const mockFederation = {
      type: 'oidc' as const,
      id: 'test-federation',
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

    return {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockFederation,
      mockSession,
      mockUserInfo,
      mockUserHandler,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct path', () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockUserHandler,
    } = createMockDependencies();

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    expect(config.path).toBe(FEDERATION_CALLBACK_PATH);
    expect(config.processRequest).toBeDefined();
  });

  it('should process request and return authorization page', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockFederation,
      mockSession,
      mockUserInfo,
      mockUserHandler,
    } = createMockDependencies();

    mockSession.get.mockImplementation((key: string) => {
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

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(
      mockExtractorConfiguration.extractPathParameter
    ).toHaveBeenCalledWith(request, FEDERATION_CALLBACK_PATH);
    expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
      'test-federation'
    );
    expect(mockFederation.processFederationResponse).toHaveBeenCalledWith(
      expect.any(URL),
      'test-state',
      'test-verifier'
    );
    const { sub, ...userInfoWithoutSub } = mockUserInfo;
    expect(mockSession.setBatch).toHaveBeenCalledWith({
      user: expect.objectContaining({
        ...userInfoWithoutSub,
        subject: `${sub}@test-federation`,
      }),
      authTime: expect.any(Number),
    });
    expect(response.status).toBe(200);
  });

  it('should return 404 for unknown federation ID', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockUserHandler,
    } = createMockDependencies();

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/unknown-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(response.status).toBe(404);
  });

  it('should return 400 when federation parameters not found', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockSession,
      mockUserHandler,
    } = createMockDependencies();

    mockSession.get.mockResolvedValue(null);

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when authorization page model not found', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockSession,
      mockUserHandler,
    } = createMockDependencies();

    mockSession.get.mockImplementation((key: string) => {
      if (key === 'federationCallbackParams') {
        return Promise.resolve({
          protocol: 'oidc',
          state: 'test-state',
          codeVerifier: 'test-verifier',
        });
      }
      return Promise.resolve(null);
    });

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when state not found in federation params', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockSession,
      mockUserHandler,
    } = createMockDependencies();

    mockSession.get.mockImplementation((key: string) => {
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

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(response.status).toBe(400);
  });

  it('should handle federation response processing error', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockFederation,
      mockSession,
      mockUserHandler,
    } = createMockDependencies();

    mockSession.get.mockImplementation((key: string) => {
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

    const config = new FederationCallbackHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
      userHandler: mockUserHandler,
    });

    const request = new Request(
      'https://example.com/api/federation/callback/test-federation?code=auth-code&state=test-state'
    );

    const response = await config.processRequest(request);

    expect(response.status).toBe(400);
  });

  describe('SAML2 protocol', () => {
    // Given: Valid SAML2 federation and session with authorizationPageModel
    // When: Processing SAML2 callback request
    // Then: Returns authorization page with user info
    it('should process SAML2 request and return authorization page', async () => {
      const {
        mockServerHandlerConfiguration,
        mockExtractorConfiguration,
        mockFederationManager,
        mockSession,
        mockUserHandler,
      } = createMockDependencies();

      const mockSaml2Federation = {
        type: 'saml2' as const,
        id: 'test-saml2-federation',
        processSaml2Response: vi.fn().mockResolvedValue({
          nameID: 'user123',
        }),
      };

      (mockFederationManager.getFederation as ReturnType<
        typeof vi.fn
      >).mockReturnValue(mockSaml2Federation);

      mockSession.get.mockImplementation((key: string) => {
        if (key === 'authorizationPageModel') {
          return Promise.resolve({
            user: null,
          });
        }
        return Promise.resolve(null);
      });

      const config = new FederationCallbackHandlerConfigurationImpl({
        serverHandlerConfiguration: mockServerHandlerConfiguration,
        extractorConfiguration: mockExtractorConfiguration,
        federationManager: mockFederationManager,
        userHandler: mockUserHandler,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/test-saml2-federation'
      );

      const response = await config.processRequest(request);

      expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
        'test-saml2-federation'
      );
      expect(mockSaml2Federation.processSaml2Response).toHaveBeenCalledWith(
        request
      );
      expect(mockSession.setBatch).toHaveBeenCalledWith({
        user: expect.objectContaining({
          subject: 'user123@test-saml2-federation',
        }),
        authTime: expect.any(Number),
      });
      expect(response.status).toBe(200);
    });

    // Given: SAML2 federation but authorizationPageModel not found
    // When: Processing SAML2 callback request
    // Then: Returns 400 error
    it('should return 400 when authorizationPageModel not found for SAML2', async () => {
      const {
        mockServerHandlerConfiguration,
        mockExtractorConfiguration,
        mockFederationManager,
        mockSession,
        mockUserHandler,
      } = createMockDependencies();

      const mockSaml2Federation = {
        type: 'saml2' as const,
        id: 'test-saml2-federation',
        processSaml2Response: vi.fn(),
      };

      (mockFederationManager.getFederation as ReturnType<
        typeof vi.fn
      >).mockReturnValue(mockSaml2Federation);

      mockSession.get.mockResolvedValue(null);

      const config = new FederationCallbackHandlerConfigurationImpl({
        serverHandlerConfiguration: mockServerHandlerConfiguration,
        extractorConfiguration: mockExtractorConfiguration,
        federationManager: mockFederationManager,
        userHandler: mockUserHandler,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/test-saml2-federation'
      );

      const response = await config.processRequest(request);

      expect(response.status).toBe(400);
    });

    // Given: SAML2 federation response processing fails
    // When: Processing SAML2 callback request
    // Then: Returns 400 error
    it('should return 400 when SAML2 response processing fails', async () => {
      const {
        mockServerHandlerConfiguration,
        mockExtractorConfiguration,
        mockFederationManager,
        mockSession,
        mockUserHandler,
      } = createMockDependencies();

      const mockSaml2Federation = {
        type: 'saml2' as const,
        id: 'test-saml2-federation',
        processSaml2Response: vi
          .fn()
          .mockRejectedValue(new Error('SAML2 processing error')),
      };

      (mockFederationManager.getFederation as ReturnType<
        typeof vi.fn
      >).mockReturnValue(mockSaml2Federation);

      mockSession.get.mockImplementation((key: string) => {
        if (key === 'authorizationPageModel') {
          return Promise.resolve({
            user: null,
          });
        }
        return Promise.resolve(null);
      });

      const config = new FederationCallbackHandlerConfigurationImpl({
        serverHandlerConfiguration: mockServerHandlerConfiguration,
        extractorConfiguration: mockExtractorConfiguration,
        federationManager: mockFederationManager,
        userHandler: mockUserHandler,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/test-saml2-federation'
      );

      const response = await config.processRequest(request);

      expect(response.status).toBe(400);
    });
  });
});
