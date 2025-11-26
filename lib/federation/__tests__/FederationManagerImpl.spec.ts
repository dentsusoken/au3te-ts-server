import { describe, it, expect, vi } from 'vitest';
import { FederationManagerImpl } from '../FederationManagerImpl';
import {
  FederationRegistry,
  FederationConfig,
} from '@vecrea/au3te-ts-common/schemas.federation';

// Mock FederationImpl to avoid actual initialization
vi.mock('../FederationImpl', () => ({
  FederationImpl: vi.fn().mockImplementation((config) => ({
    id: config.id,
  })),
}));

describe('FederationManagerImpl', () => {
  const createMockFederationConfig = (id: string): FederationConfig => ({
    id,
    protocol: 'oidc',
    client: {
      clientId: `client-${id}`,
      clientSecret: `secret-${id}`,
      redirectUri: `https://example.com/callback/${id}`,
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
});
