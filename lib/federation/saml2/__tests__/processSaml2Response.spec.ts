import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessSaml2Response } from '../processSaml2Response';
import { Saml2Configuration } from '../Saml2Configuration';
import * as samlify from 'samlify';
import { saml2LoginResponseSchema } from '@vecrea/au3te-ts-common/schemas.federation';

// Mock saml2LoginResponseSchema
vi.mock('@vecrea/au3te-ts-common/schemas.federation', () => ({
  saml2LoginResponseSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe('createProcessSaml2Response', () => {
  const createMockConfig = (): Saml2Configuration => {
    const mockIdp = {} as samlify.IdentityProviderInstance;
    const mockSp = {
      parseLoginResponse: vi.fn(),
    } as any;

    const config: Saml2Configuration = {
      getIdp: vi.fn().mockResolvedValue(mockIdp),
      getSp: vi.fn().mockResolvedValue(mockSp),
    };

    // Make mockSp accessible for test setup
    (config as any).mockSp = mockSp;

    return config;
  };

  const createMockSaml2Response = () => ({
    nameID: 'user123',
    attributes: {
      email: 'user@example.com',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.log mock
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('POST binding', () => {
    // Given: POST request with SAMLResponse and RelayState
    // When: Processing SAML2 response
    // Then: Returns parsed SAML2 login response
    it('should process POST request with SAMLResponse and RelayState', async () => {
      const mockExtract = createMockSaml2Response();
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      mockSp.parseLoginResponse = vi.fn().mockResolvedValue({
        extract: mockExtract,
      });

      const processSaml2Response = createProcessSaml2Response(config);

      const formData = new FormData();
      formData.append('SAMLResponse', 'saml-response-base64');
      formData.append('RelayState', 'relay-state-123');

      const request = new Request('https://example.com/callback', {
        method: 'POST',
        body: formData,
      });

      const result = await processSaml2Response(request);

      expect(result).toEqual(mockExtract);
      expect(mockSp.parseLoginResponse).toHaveBeenCalledWith(
        await config.getIdp(),
        'post',
        {
          body: {
            SAMLResponse: 'saml-response-base64',
            RelayState: 'relay-state-123',
          },
        }
      );
      expect(saml2LoginResponseSchema.parse).toHaveBeenCalledWith(mockExtract);
    });

    // Given: POST request with SAMLResponse but no RelayState
    // When: Processing SAML2 response
    // Then: Returns parsed SAML2 login response
    it('should process POST request with SAMLResponse but no RelayState', async () => {
      const mockExtract = createMockSaml2Response();
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      mockSp.parseLoginResponse = vi.fn().mockResolvedValue({
        extract: mockExtract,
      });

      const processSaml2Response = createProcessSaml2Response(config);

      const formData = new FormData();
      formData.append('SAMLResponse', 'saml-response-base64');

      const request = new Request('https://example.com/callback', {
        method: 'POST',
        body: formData,
      });

      const result = await processSaml2Response(request);

      expect(result).toEqual(mockExtract);
      expect(mockSp.parseLoginResponse).toHaveBeenCalledWith(
        await config.getIdp(),
        'post',
        {
          body: {
            SAMLResponse: 'saml-response-base64',
            RelayState: null,
          },
        }
      );
    });

    // Given: POST request without SAMLResponse
    // When: Processing SAML2 response
    // Then: Throws error
    it('should throw error when SAMLResponse is missing in POST request', async () => {
      const config = createMockConfig();
      const processSaml2Response = createProcessSaml2Response(config);

      const formData = new FormData();
      formData.append('RelayState', 'relay-state-123');

      const request = new Request('https://example.com/callback', {
        method: 'POST',
        body: formData,
      });

      await expect(processSaml2Response(request)).rejects.toThrow(
        'SAMLResponse is not included in response.'
      );
    });

    // Given: POST request with SAMLResponse
    // When: parseLoginResponse throws error
    // Then: Error is logged and then re-thrown as SAMLResponse error
    it('should log error when parseLoginResponse fails in POST request', async () => {
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      const parseError = new Error('Parse error');
      mockSp.parseLoginResponse = vi.fn().mockRejectedValue(parseError);

      const processSaml2Response = createProcessSaml2Response(config);

      const formData = new FormData();
      formData.append('SAMLResponse', 'saml-response-base64');

      const request = new Request('https://example.com/callback', {
        method: 'POST',
        body: formData,
      });

      // Note: Current implementation logs error and then continues to GET handling
      // which throws "SAMLResponse is not included in response" error
      await expect(processSaml2Response(request)).rejects.toThrow(
        'SAMLResponse is not included in response.'
      );
      expect(console.log).toHaveBeenCalledWith('e :>> ', parseError);
    });
  });

  describe('GET binding (redirect)', () => {
    // Given: GET request with SAMLResponse in query string
    // When: Processing SAML2 response
    // Then: Returns parsed SAML2 login response
    it('should process GET request with SAMLResponse in query string', async () => {
      const mockExtract = createMockSaml2Response();
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      mockSp.parseLoginResponse = vi.fn().mockResolvedValue({
        extract: mockExtract,
      });

      const processSaml2Response = createProcessSaml2Response(config);

      const request = new Request(
        'https://example.com/callback?SAMLResponse=saml-response&RelayState=relay-state'
      );

      const result = await processSaml2Response(request);

      expect(result).toEqual(mockExtract);
      expect(mockSp.parseLoginResponse).toHaveBeenCalledWith(
        await config.getIdp(),
        'redirect',
        {
          query: '?SAMLResponse=saml-response&RelayState=relay-state',
        }
      );
      expect(saml2LoginResponseSchema.parse).toHaveBeenCalledWith(mockExtract);
    });

    // Given: GET request without SAMLResponse in query string
    // When: Processing SAML2 response
    // Then: Throws error
    it('should throw error when SAMLResponse is missing in GET request', async () => {
      const config = createMockConfig();
      const processSaml2Response = createProcessSaml2Response(config);

      const request = new Request('https://example.com/callback?RelayState=relay-state');

      await expect(processSaml2Response(request)).rejects.toThrow(
        'SAMLResponse is not included in response.'
      );
    });

    // Given: GET request with SAMLResponse
    // When: parseLoginResponse throws error
    // Then: Error is propagated
    it('should propagate error when parseLoginResponse fails in GET request', async () => {
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      const parseError = new Error('Parse error');
      mockSp.parseLoginResponse = vi.fn().mockRejectedValue(parseError);

      const processSaml2Response = createProcessSaml2Response(config);

      const request = new Request(
        'https://example.com/callback?SAMLResponse=saml-response'
      );

      await expect(processSaml2Response(request)).rejects.toThrow('Parse error');
    });
  });

  describe('error handling', () => {
    // Given: Configuration
    // When: getIdp fails
    // Then: Error is propagated
    it('should propagate error when getIdp fails', async () => {
      const config: Saml2Configuration = {
        getIdp: vi.fn().mockRejectedValue(new Error('IdP error')),
        getSp: vi.fn().mockResolvedValue({}),
      };

      const processSaml2Response = createProcessSaml2Response(config);
      const request = new Request('https://example.com/callback?SAMLResponse=test');

      await expect(processSaml2Response(request)).rejects.toThrow('IdP error');
    });

    // Given: Configuration
    // When: getSp fails
    // Then: Error is propagated
    it('should propagate error when getSp fails', async () => {
      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue({}),
        getSp: vi.fn().mockRejectedValue(new Error('SP error')),
      };

      const processSaml2Response = createProcessSaml2Response(config);
      const request = new Request('https://example.com/callback?SAMLResponse=test');

      await expect(processSaml2Response(request)).rejects.toThrow('SP error');
    });

    // Given: Valid response
    // When: Schema validation fails
    // Then: Error is propagated
    it('should propagate error when schema validation fails', async () => {
      const mockExtract = { invalid: 'data' };
      const config = createMockConfig();
      const mockSp = (config as any).mockSp;
      mockSp.parseLoginResponse = vi.fn().mockResolvedValue({
        extract: mockExtract,
      });

      const validationError = new Error('Validation error');
      (saml2LoginResponseSchema.parse as any).mockImplementation(() => {
        throw validationError;
      });

      const processSaml2Response = createProcessSaml2Response(config);
      const request = new Request(
        'https://example.com/callback?SAMLResponse=saml-response'
      );

      await expect(processSaml2Response(request)).rejects.toThrow('Validation error');
    });
  });
});
