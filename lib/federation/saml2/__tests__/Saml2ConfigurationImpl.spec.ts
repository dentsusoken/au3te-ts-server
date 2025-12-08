import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Saml2ConfigurationImpl } from '../Saml2ConfigurationImpl';
import { FederationConfig } from '@vecrea/au3te-ts-common/schemas.federation';
import * as samlify from 'samlify';
import * as validator from 'samlify-validator-js';


// Mock samlify
vi.mock('samlify', () => {
  const mockIdp = {
    entityMeta: {
      getSingleSignOnService: vi.fn(),
    },
  };
  const mockSp = {
    entityMeta: {
      getAssertionConsumerService: vi.fn(),
    },
  };

  return {
    setSchemaValidator: vi.fn(),
    IdentityProvider: vi.fn().mockReturnValue(mockIdp),
    ServiceProvider: vi.fn().mockReturnValue(mockSp),
  };
});

describe('Saml2ConfigurationImpl', () => {
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
      authnRequestsSigned: false,
      wantAssertionsSigned: true,
      wantMessageSigned: false,
      wantLogoutResponseSigned: false,
      wantLogoutRequestSigned: false,
      metadata: '<EntityDescriptor>...</EntityDescriptor>',
    },
  } as FederationConfig);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('constructor', () => {
    // Given: Valid SAML2 configuration
    // When: Creating Saml2ConfigurationImpl instance
    // Then: Instance is created successfully and validator is set
    it('should create instance with valid SAML2 configuration', () => {
      const config = createMockSaml2Config();
      const instance = new Saml2ConfigurationImpl(config, validator);

      expect(instance).toBeDefined();
      expect(samlify.setSchemaValidator).toHaveBeenCalledWith(validator);
    });

    // Given: Configuration with non-SAML2 protocol
    // When: Creating Saml2ConfigurationImpl instance
    // Then: Error is thrown
    it('should throw error for non-SAML2 protocol', () => {
      const config = {
        id: 'test',
        protocol: 'oidc',
        client: {
          clientId: 'test',
          clientSecret: 'secret',
          redirectUri: 'https://example.com',
          scopes: ['openid'],
        },
        server: {
          name: 'Test',
          issuer: 'https://test.com',
        },
      } as FederationConfig;

      expect(() => {
        new Saml2ConfigurationImpl(config, validator);
      }).toThrow("Unsupported protocol: oidc. Only 'saml2' protocol is supported.");
    });
  });

  describe('getIdp', () => {
    // Given: Configuration with metadata
    // When: Getting IdP instance
    // Then: Returns IdP instance without fetching metadata
    it('should return IdP instance when metadata exists', async () => {
      const config = createMockSaml2Config();
      const instance = new Saml2ConfigurationImpl(config, validator);

      const idp = await instance.getIdp();

      expect(idp).toBeDefined();
      expect(samlify.IdentityProvider).toHaveBeenCalledWith((config as any).idp);
      expect(fetch).not.toHaveBeenCalled();
    });

    // Given: Configuration with metadataUrl but no metadata
    // When: Getting IdP instance
    // Then: Fetches metadata and returns IdP instance
    it('should fetch metadata from metadataUrl when metadata is missing', async () => {
      const mockMetadata = '<EntityDescriptor>fetched metadata</EntityDescriptor>';
      global.fetch = vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(mockMetadata),
      } as any);

      const config: FederationConfig = {
        id: 'test-saml2',
        protocol: 'saml2',
        name: 'test-saml2',
        idp: {
          metadataUrl: 'https://idp.example.com/metadata',
        } as any,
        sp: {
          entityID: 'https://sp.example.com',
          metadata: '<EntityDescriptor>...</EntityDescriptor>',
        },
      } as FederationConfig;

      const instance = new Saml2ConfigurationImpl(config, validator);

      const idp = await instance.getIdp();

      expect(idp).toBeDefined();
      expect(fetch).toHaveBeenCalledWith('https://idp.example.com/metadata');
      expect(samlify.IdentityProvider).toHaveBeenCalled();
    });

    // Given: Configuration with metadataUrl
    // When: Fetch fails
    // Then: Error is propagated
    it('should propagate error when metadata fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const config: FederationConfig = {
        id: 'test-saml2',
        protocol: 'saml2',
        name: 'test-saml2',
        idp: {
          metadataUrl: 'https://idp.example.com/metadata',
        } as any,
        sp: {
          entityID: 'https://sp.example.com',
          metadata: '<EntityDescriptor>...</EntityDescriptor>',
        },
      } as FederationConfig;

      const instance = new Saml2ConfigurationImpl(config, validator);

      await expect(instance.getIdp()).rejects.toThrow('Network error');
    });
  });

  describe('getSp', () => {
    // Given: Valid SAML2 configuration
    // When: Getting SP instance
    // Then: Returns SP instance
    it('should return SP instance', async () => {
      const config = createMockSaml2Config();
      const instance = new Saml2ConfigurationImpl(config, validator);

      const sp = await instance.getSp();

      expect(sp).toBeDefined();
      expect(samlify.ServiceProvider).toHaveBeenCalledWith((config as any).sp);
    });
  });
});
