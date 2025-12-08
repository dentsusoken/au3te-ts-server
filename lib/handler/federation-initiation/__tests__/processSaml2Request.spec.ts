import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessSaml2Request } from '../processSaml2Request';
import { Saml2Federation } from '@/federation/saml2/Saml2Federation';
import { ResponseFactory } from '../../core';

describe('createProcessSaml2Request', () => {
  const createMockDependencies = () => {
    const mockResponseFactory: ResponseFactory = {
      location: vi.fn((url: string) =>
        new Response(null, {
          status: 302,
          headers: { Location: url },
        })
      ),
      html: vi.fn((html: string) =>
        new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      ),
    } as unknown as ResponseFactory;

    const mockFederation: Saml2Federation = {
      id: 'test-saml2-federation',
      type: 'saml2',
      processLoginRequest: vi.fn(),
    } as unknown as Saml2Federation;

    return {
      mockResponseFactory,
      mockFederation,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful processing', () => {
    // Given: Federation with redirect login request
    // When: Processing SAML2 initiation request
    // Then: Returns redirect response
    it('should process SAML2 initiation request and return redirect for redirect type', async () => {
      const { mockResponseFactory, mockFederation } = createMockDependencies();

      (mockFederation.processLoginRequest as ReturnType<
        typeof vi.fn
      >).mockResolvedValue({
        type: 'redirect',
        location: 'https://idp.example.com/login',
      });

      const processSaml2Request = createProcessSaml2Request({
        responseFactory: mockResponseFactory,
      });

      const response = await processSaml2Request(mockFederation);

      expect(mockFederation.processLoginRequest).toHaveBeenCalled();
      expect(mockResponseFactory.location).toHaveBeenCalledWith(
        'https://idp.example.com/login'
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        'https://idp.example.com/login'
      );
    });

    // Given: Federation with POST login request
    // When: Processing SAML2 initiation request
    // Then: Returns HTML response
    it('should process SAML2 initiation request and return HTML for post type', async () => {
      const { mockResponseFactory, mockFederation } = createMockDependencies();

      const mockHtml = '<html>...</html>';
      (mockFederation.processLoginRequest as ReturnType<
        typeof vi.fn
      >).mockResolvedValue({
        type: 'post',
        html: mockHtml,
      });

      const processSaml2Request = createProcessSaml2Request({
        responseFactory: mockResponseFactory,
      });

      const response = await processSaml2Request(mockFederation);

      expect(mockFederation.processLoginRequest).toHaveBeenCalled();
      expect(mockResponseFactory.html).toHaveBeenCalledWith(mockHtml);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/html');
    });
  });

  describe('error handling', () => {
    // Given: Federation processLoginRequest fails
    // When: Processing SAML2 initiation request
    // Then: Error is propagated
    it('should propagate error when processLoginRequest fails', async () => {
      const { mockResponseFactory, mockFederation } = createMockDependencies();

      (mockFederation.processLoginRequest as ReturnType<
        typeof vi.fn
      >).mockRejectedValue(new Error('Login request error'));

      const processSaml2Request = createProcessSaml2Request({
        responseFactory: mockResponseFactory,
      });

      await expect(processSaml2Request(mockFederation)).rejects.toThrow(
        'Login request error'
      );
    });
  });
});
