import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederationInitiationHandlerConfigurationImpl } from '../FederationInitiationHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { SessionSchemas } from '../../../session/types';
import { FederationManager } from '@/federation/FederationManager';
import { ExtractorConfiguration } from '@/extractor/ExtractorConfiguration';
import { FEDERATION_INITIATION_PATH } from '../FederationInitiationHandlerConfigurationImpl';

describe('FederationInitiationHandlerConfigurationImpl', () => {
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
      responseFactory: {
        location: vi.fn((url: string) =>
          new Response(null, {
            status: 302,
            headers: { Location: url },
          })
        ),
      },
      responseErrorFactory: {
        notFoundResponseError: vi.fn((message: string) => ({
          response: new Response(message, { status: 404 }),
        })),
      },
      session: mockSession,
    } as unknown as ServerHandlerConfiguration<SessionSchemas>;

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

    const mockFederation = {
      createFederationRequest: vi.fn().mockResolvedValue(
        new URL('https://auth-server.com/auth?state=test-state&code_challenge=challenge')
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

    return {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockFederation,
      mockSession,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct path', () => {
    const { mockServerHandlerConfiguration, mockExtractorConfiguration, mockFederationManager } =
      createMockDependencies();

    const config = new FederationInitiationHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
    });

    expect(config.path).toBe(FEDERATION_INITIATION_PATH);
    expect(config.processRequest).toBeDefined();
  });

  it('should process request and redirect to authentication endpoint', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockFederation,
      mockSession,
    } = createMockDependencies();

    const config = new FederationInitiationHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
    });

    const request = new Request('https://example.com/api/federation/initiation/test-federation');

    const response = await config.processRequest(request);

    expect(mockExtractorConfiguration.extractPathParameter).toHaveBeenCalledWith(
      request,
      FEDERATION_INITIATION_PATH
    );
    expect(mockFederationManager.getFederation).toHaveBeenCalledWith('test-federation');
    expect(mockFederation.createFederationRequest).toHaveBeenCalled();
    expect(mockSession.set).toHaveBeenCalledWith('federationCallbackParams', expect.objectContaining({
      state: expect.any(String),
      codeVerifier: expect.any(String),
    }));
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('https://auth-server.com/auth');
  });

  it('should return 404 for unknown federation ID', async () => {
    const { mockServerHandlerConfiguration, mockExtractorConfiguration, mockFederationManager } =
      createMockDependencies();

    const config = new FederationInitiationHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
    });

    const request = new Request('https://example.com/api/federation/initiation/unknown-federation');

    const response = await config.processRequest(request);

    expect(response.status).toBe(404);
  });

  it('should generate random state and codeVerifier', async () => {
    const {
      mockServerHandlerConfiguration,
      mockExtractorConfiguration,
      mockFederationManager,
      mockSession,
    } = createMockDependencies();

    const config = new FederationInitiationHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerHandlerConfiguration,
      extractorConfiguration: mockExtractorConfiguration,
      federationManager: mockFederationManager,
    });

    const request = new Request('https://example.com/api/federation/initiation/test-federation');

    await config.processRequest(request);

    const setCall = mockSession.set.mock.calls.find(
      (call) => call[0] === 'federationCallbackParams'
    );
    expect(setCall).toBeDefined();
    const federationCallbackParams = setCall[1];
    expect(federationCallbackParams.state).toBeDefined();
    expect(federationCallbackParams.codeVerifier).toBeDefined();
    expect(typeof federationCallbackParams.state).toBe('string');
    expect(typeof federationCallbackParams.codeVerifier).toBe('string');
  });
});

