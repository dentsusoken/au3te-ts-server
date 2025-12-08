import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Saml2FederationImpl } from '../Saml2FederationImpl';
import { FederationConfig } from '@vecrea/au3te-ts-common/schemas.federation';
import * as validator from 'samlify-validator-js';

// Mock Saml2ConfigurationImpl
vi.mock('../Saml2ConfigurationImpl', () => {
  const mockConfig = {
    getIdp: vi.fn().mockResolvedValue({}),
    getSp: vi.fn().mockResolvedValue({}),
  };

  class MockSaml2ConfigurationImpl {
    getIdp = mockConfig.getIdp;
    getSp = mockConfig.getSp;
  }

  return {
    Saml2ConfigurationImpl: MockSaml2ConfigurationImpl,
  };
});

// Mock processLoginRequest and processSaml2Response
vi.mock('../processLoginRequest', () => ({
  createProcessLoginRequest: vi.fn(() => vi.fn().mockResolvedValue({
    type: 'redirect',
    location: 'https://idp.example.com/login',
  })),
}));

vi.mock('../processSaml2Response', () => ({
  createProcessSaml2Response: vi.fn(() => vi.fn().mockResolvedValue({
    nameID: 'user123',
  })),
}));

describe('Saml2FederationImpl', () => {
  const createMockSaml2Config = (): FederationConfig => ({
    id: 'test-saml2',
    protocol: 'saml2',
    name: 'test-saml2',
    idp: {
      metadataUrl: 'https://idp.example.com/metadata',
      metadata: '<EntityDescriptor>...</EntityDescriptor>',
    },
    sp: {
      entityID: 'https://sp.example.com',
      metadata: '<EntityDescriptor>...</EntityDescriptor>',
    },
  } as FederationConfig);


  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    // Given: Valid SAML2 configuration and validator
    // When: Creating Saml2FederationImpl instance
    // Then: Instance is created with correct properties
    it('should create instance with valid configuration', () => {
      const config = createMockSaml2Config();
      const instance = new Saml2FederationImpl(config, validator);

      expect(instance.id).toBe('test-saml2');
      expect(instance.type).toBe('saml2');
      expect(instance.processLoginRequest).toBeDefined();
      expect(instance.processSaml2Response).toBeDefined();
    });

    // Given: Configuration with different ID
    // When: Creating Saml2FederationImpl instance
    // Then: Instance has correct ID
    it('should set id from config', () => {
      const config = {
        ...createMockSaml2Config(),
        id: 'custom-id',
      };
      const instance = new Saml2FederationImpl(config, validator);

      expect(instance.id).toBe('custom-id');
    });
  });

  describe('processLoginRequest', () => {
    // Given: Saml2FederationImpl instance
    // When: Calling processLoginRequest
    // Then: Returns login request
    it('should return login request', async () => {
      const config = createMockSaml2Config();
      const instance = new Saml2FederationImpl(config, validator);

      const result = await instance.processLoginRequest();

      expect(result).toBeDefined();
      expect(result.type).toBe('redirect');
      expect((result as any).location).toBe('https://idp.example.com/login');
    });
  });

  describe('processSaml2Response', () => {
    // Given: Saml2FederationImpl instance and Request
    // When: Calling processSaml2Response
    // Then: Returns SAML2 response
    it('should return SAML2 response', async () => {
      const config = createMockSaml2Config();
      const instance = new Saml2FederationImpl(config, validator);
      const request = new Request('https://example.com/callback');

      const result = await instance.processSaml2Response(request);

      expect(result).toBeDefined();
      expect(result.nameID).toBe('user123');
    });
  });
});
