import { describe, it, expect, vi } from 'vitest';
import { FederationManagerImpl } from '../../FederationManagerImpl';
import {
  FederationRegistry,
  FederationConfig,
} from '@vecrea/au3te-ts-common/schemas.federation';
import * as validator from 'samlify-validator-js';

// Mock federationConfigSchema to accept both OIDC and SAML2 configurations
vi.mock('@vecrea/au3te-ts-common/schemas.federation', async () => {
  const actual = await vi.importActual('@vecrea/au3te-ts-common/schemas.federation');
  return {
    ...actual,
    federationConfigSchema: {
      safeParse: vi.fn((config: any) => {
        // Accept both OIDC and SAML2 configurations
        if (config && config.id && (config.protocol === 'oidc' || config.protocol === 'saml2')) {
          return { success: true, data: config };
        }
        return { success: false, error: {} };
      }),
    },
  };
});

// Mock OidcFederationImpl and Saml2FederationImpl to avoid actual initialization
vi.mock('../oidc/OidcFederationImpl', () => ({
  OidcFederationImpl: vi.fn().mockImplementation((config) => ({
    id: config.id,
    type: 'oidc',
  })),
}));

vi.mock('../../saml2/Saml2FederationImpl', () => {
  class MockSaml2FederationImpl {
    id: string;
    type = 'saml2';
    constructor(config: any) {
      this.id = config.id;
    }
  }
  return {
    Saml2FederationImpl: MockSaml2FederationImpl,
  };
});

describe('FederationManagerImpl', () => {
  const createMockFederationConfig = (id: string): FederationConfig => ({
    id,
    protocol: 'oidc',
    client: {
      clientId: `client-${id}`,
      clientSecret: `secret-${id}`,
      redirectUri: `https://example.com/callback/${id}`,
      scopes: ['openid'],
      idTokenSignedResponseAlg: 'RS256',
    },
    server: {
      name: `Server ${id}`,
      issuer: `https://server-${id}.com`,
    },
  });

  describe('constructor', () => {
    it('should initialize with valid configurations', () => {
      const registry: FederationRegistry = {
        federations: [createMockFederationConfig('fed1')],
      };
      const manager = new FederationManagerImpl({ registry });

      expect(manager.getConfigurations()).toEqual(registry);
    });

    it('should handle null configurations', () => {
      const registry: FederationRegistry = null;

      const manager = new FederationManagerImpl({ registry });

      expect(manager.getConfigurations()).toBeNull();
      expect(manager.buildFederations().size).toBe(0);
    });

    it('should handle undefined configurations', () => {
      const registry: FederationRegistry = undefined;

      const manager = new FederationManagerImpl({ registry });

      expect(manager.getConfigurations()).toBeUndefined();
      expect(manager.buildFederations().size).toBe(0);
    });
  });

  describe('isConfigurationValid', () => {
    it('should return true for valid configuration at valid index', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('fed1'),
          createMockFederationConfig('fed2'),
        ],
      };

      const manager = new FederationManagerImpl({ registry });

      expect(manager.isConfigurationValid(0)).toBe(true);
      expect(manager.isConfigurationValid(1)).toBe(true);
    });

    it('should return false for invalid index', () => {
      const registry: FederationRegistry = {
        federations: [createMockFederationConfig('fed1')],
      };

      const manager = new FederationManagerImpl({ registry });

      expect(manager.isConfigurationValid(-1)).toBe(false);
      expect(manager.isConfigurationValid(1)).toBe(false);
    });

    it('should return false for null configurations', () => {
      const registry: FederationRegistry = null;
      const manager = new FederationManagerImpl({ registry });

      expect(manager.isConfigurationValid(0)).toBe(false);
    });

    it('should return false for invalid configuration', () => {
      const registry: FederationRegistry = {
        federations: [
          {
            id: '',
            protocol: 'oidc',
            client: {
              protocol: 'oidc',
              clientId: 'test',
              clientSecret: 'secret',
              redirectUri: 'https://example.com',
              scopes: ['openid'],
            },
            server: {
              protocol: 'oidc',
              name: 'Test',
              issuer: 'https://test.com',
            },
          } as FederationConfig,
        ],
      };

      const manager = new FederationManagerImpl({ registry });

      expect(manager.isConfigurationValid(0)).toBe(false);
    });
  });

  describe('buildFederations', () => {
    it('should build federations map from valid configurations', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('fed1'),
          createMockFederationConfig('fed2'),
        ],
      };

      const manager = new FederationManagerImpl({ registry });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(2);
      expect(federations.has('fed1')).toBe(true);
      expect(federations.has('fed2')).toBe(true);
    });

    it('should skip invalid configurations', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('fed1'),
          {
            id: '',
            protocol: 'oidc',
            client: {
              protocol: 'oidc',
              clientId: 'test',
              clientSecret: 'secret',
              redirectUri: 'https://example.com',
              scopes: ['openid'],
            },
            server: {
              protocol: 'oidc',
              name: 'Test',
              issuer: 'https://test.com',
            },
          } as FederationConfig,
        ],
      };

      const manager = new FederationManagerImpl({ registry });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(1);
      expect(federations.has('fed1')).toBe(true);
    });

    it('should return empty map for null configurations', () => {
      const registry: FederationRegistry = null;
      const manager = new FederationManagerImpl({ registry });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(0);
    });
  });

  describe('getFederation', () => {
    it('should return federation by id', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('fed1'),
          createMockFederationConfig('fed2'),
        ],
      };

      const manager = new FederationManagerImpl({ registry });
      const federation = manager.getFederation('fed1');

      expect(federation).toBeDefined();
    });

    it('should throw error for non-existent federation', () => {
      const registry: FederationRegistry = {
        federations: [createMockFederationConfig('fed1')],
      };

      const manager = new FederationManagerImpl({ registry });

      expect(() => manager.getFederation('non-existent')).toThrow(
        "Federation with ID 'non-existent' not found"
      );
    });
  });

  describe('getConfigurations', () => {
    it('should return configurations', () => {
      const registry: FederationRegistry = {
        federations: [createMockFederationConfig('fed1')],
      };

      const manager = new FederationManagerImpl({ registry });

      expect(manager.getConfigurations()).toEqual(registry);
    });
  });

  describe('SAML2 protocol', () => {
    const createMockSaml2Config = (id: string): FederationConfig => ({
      id,
      protocol: 'saml2',
      name: `saml2-${id}`,
      idp: {
        metadataUrl: 'https://idp.example.com/metadata',
        metadata: '<EntityDescriptor>...</EntityDescriptor>',
      },
      sp: {
        entityID: `https://sp-${id}.example.com`,
        authnRequestsSigned: false,
        wantAssertionsSigned: true,
        wantMessageSigned: false,
        wantLogoutResponseSigned: false,
        wantLogoutRequestSigned: false,
        metadata: '<EntityDescriptor>...</EntityDescriptor>',
      },
    } as FederationConfig);

    // Given: Valid SAML2 configuration with validator
    // When: Building federations
    // Then: SAML2 federation is included
    it('should build SAML2 federation when validator is provided', () => {
      const config = createMockSaml2Config('saml2-fed1');
      const registry: FederationRegistry = {
        federations: [config],
      };

      const manager = new FederationManagerImpl({
        registry,
        validator,
      });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(1);
      expect(federations.has('saml2-fed1')).toBe(true);
    });

    // Given: SAML2 configuration without validator
    // When: Building federations
    // Then: SAML2 federation is skipped
    it('should skip SAML2 federation when validator is not provided', () => {
      const registry: FederationRegistry = {
        federations: [createMockSaml2Config('saml2-fed1')],
      };

      const manager = new FederationManagerImpl({ registry });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(0);
    });

    // Given: Mixed OIDC and SAML2 configurations with validator
    // When: Building federations
    // Then: Both federations are included
    it('should build both OIDC and SAML2 federations when validator is provided', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('oidc-fed1'),
          createMockSaml2Config('saml2-fed1'),
        ],
      };

      const manager = new FederationManagerImpl({
        registry,
        validator,
      });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(2);
      expect(federations.has('oidc-fed1')).toBe(true);
      expect(federations.has('saml2-fed1')).toBe(true);
    });

    // Given: Mixed OIDC and SAML2 configurations without validator
    // When: Building federations
    // Then: Only OIDC federation is included
    it('should build only OIDC federation when validator is not provided', () => {
      const registry: FederationRegistry = {
        federations: [
          createMockFederationConfig('oidc-fed1'),
          createMockSaml2Config('saml2-fed1'),
        ],
      };

      const manager = new FederationManagerImpl({ registry });
      const federations = manager.buildFederations();

      expect(federations.size).toBe(1);
      expect(federations.has('oidc-fed1')).toBe(true);
      expect(federations.has('saml2-fed1')).toBe(false);
    });

    // Given: Valid SAML2 configuration with validator
    // When: Getting federation by ID
    // Then: Returns SAML2 federation
    it('should return SAML2 federation by id when validator is provided', () => {
      const registry: FederationRegistry = {
        federations: [createMockSaml2Config('saml2-fed1')],
      };

      const manager = new FederationManagerImpl({
        registry,
        validator,
      });
      const federation = manager.getFederation('saml2-fed1');

      expect(federation).toBeDefined();
      expect(federation.type).toBe('saml2');
    });
  });
});
