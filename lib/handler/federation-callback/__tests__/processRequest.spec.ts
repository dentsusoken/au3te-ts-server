import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessRequest } from '../processRequest';
import { ExtractPathParameter } from '@/extractor/extractPathParameter';
import { FederationManager } from '@/federation/FederationManager';
import { ResponseErrorFactory } from '../../core';
import { ProcessOidcRequest } from '../processOidcRequest';
import { ProcessSaml2Request } from '../processSaml2Request';

describe('createProcessRequest (federation-callback)', () => {
  const createMockDependencies = () => {
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

    const mockOidcFederation = {
      id: 'test-oidc-federation',
      type: 'oidc' as const,
    };

    const mockSaml2Federation = {
      id: 'test-saml2-federation',
      type: 'saml2' as const,
    };

    const mockFederationManager = {
      getFederation: vi.fn((id: string) => {
        if (id === 'test-oidc-federation') {
          return mockOidcFederation;
        }
        if (id === 'test-saml2-federation') {
          return mockSaml2Federation;
        }
        throw new Error(`Federation with ID '${id}' not found`);
      }),
    } as unknown as FederationManager;

    const mockResponseErrorFactory: ResponseErrorFactory = {
      notFoundResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 404 }),
      })),
    } as unknown as ResponseErrorFactory;

    const mockProcessOidcRequest: ProcessOidcRequest = vi
      .fn()
      .mockResolvedValue(new Response('OIDC response', { status: 200 }));

    const mockProcessSaml2Request: ProcessSaml2Request = vi
      .fn()
      .mockResolvedValue(new Response('SAML2 response', { status: 200 }));

    return {
      mockExtractPathParameter,
      mockFederationManager,
      mockResponseErrorFactory,
      mockProcessOidcRequest,
      mockProcessSaml2Request,
      mockOidcFederation,
      mockSaml2Federation,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OIDC federation', () => {
    // Given: Request with OIDC federation ID
    // When: Processing request
    // Then: Calls processOidcRequest
    it('should call processOidcRequest for OIDC federation', async () => {
      const {
        mockExtractPathParameter,
        mockFederationManager,
        mockResponseErrorFactory,
        mockProcessOidcRequest,
        mockProcessSaml2Request,
        mockOidcFederation,
      } = createMockDependencies();

      const processRequest = createProcessRequest({
        path: '/api/federation/callback/:federationId',
        extractPathParameter: mockExtractPathParameter,
        federationManager: mockFederationManager,
        responseErrorFactory: mockResponseErrorFactory,
        processOidcRequest: mockProcessOidcRequest,
        processSaml2Request: mockProcessSaml2Request,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/test-oidc-federation'
      );
      const response = await processRequest(request);

      expect(mockExtractPathParameter).toHaveBeenCalledWith(
        request,
        '/api/federation/callback/:federationId'
      );
      expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
        'test-oidc-federation'
      );
      expect(mockProcessOidcRequest).toHaveBeenCalledWith(
        request,
        mockOidcFederation
      );
      expect(mockProcessSaml2Request).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('SAML2 federation', () => {
    // Given: Request with SAML2 federation ID
    // When: Processing request
    // Then: Calls processSaml2Request
    it('should call processSaml2Request for SAML2 federation', async () => {
      const {
        mockExtractPathParameter,
        mockFederationManager,
        mockResponseErrorFactory,
        mockProcessOidcRequest,
        mockProcessSaml2Request,
        mockSaml2Federation,
      } = createMockDependencies();

      const processRequest = createProcessRequest({
        path: '/api/federation/callback/:federationId',
        extractPathParameter: mockExtractPathParameter,
        federationManager: mockFederationManager,
        responseErrorFactory: mockResponseErrorFactory,
        processOidcRequest: mockProcessOidcRequest,
        processSaml2Request: mockProcessSaml2Request,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/test-saml2-federation'
      );
      const response = await processRequest(request);

      expect(mockExtractPathParameter).toHaveBeenCalledWith(
        request,
        '/api/federation/callback/:federationId'
      );
      expect(mockFederationManager.getFederation).toHaveBeenCalledWith(
        'test-saml2-federation'
      );
      expect(mockProcessSaml2Request).toHaveBeenCalledWith(
        request,
        mockSaml2Federation
      );
      expect(mockProcessOidcRequest).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('error handling', () => {
    // Given: Unknown federation ID
    // When: Processing request
    // Then: Returns 404 error
    it('should return 404 for unknown federation ID', async () => {
      const {
        mockExtractPathParameter,
        mockFederationManager,
        mockResponseErrorFactory,
        mockProcessOidcRequest,
        mockProcessSaml2Request,
      } = createMockDependencies();

      const processRequest = createProcessRequest({
        path: '/api/federation/callback/:federationId',
        extractPathParameter: mockExtractPathParameter,
        federationManager: mockFederationManager,
        responseErrorFactory: mockResponseErrorFactory,
        processOidcRequest: mockProcessOidcRequest,
        processSaml2Request: mockProcessSaml2Request,
      });

      const request = new Request(
        'https://example.com/api/federation/callback/unknown-federation'
      );
      const response = await processRequest(request);

      expect(response.status).toBe(404);
      expect(mockResponseErrorFactory.notFoundResponseError).toHaveBeenCalledWith(
        "Federation with ID 'unknown-federation' not found"
      );
      expect(mockProcessOidcRequest).not.toHaveBeenCalled();
      expect(mockProcessSaml2Request).not.toHaveBeenCalled();
    });
  });
});
