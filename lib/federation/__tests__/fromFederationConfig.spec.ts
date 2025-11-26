import { describe, it, expect } from 'vitest';
import { createFromFederationConfig } from '../fromFederationConfig';
import {
  FederationConfig,
  OidcClientConfig,
} from '@vecrea/au3te-ts-common/schemas.federation';

describe('createFromFederationConfig', () => {
  const mockConfig: FederationConfig = {
    id: 'test-federation',
    protocol: 'oidc',
    client: {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
      idTokenSignedResponseAlg: 'RS256',
    },
    server: {
      name: 'Test Server',
      issuer: 'https://test-server.com',
    },
  };

  it('should extract id from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['id']);

    expect(result).toBe('test-federation');
  });

  it('should extract client.clientId from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['client', 'clientId']);

    expect(result).toBe('test-client-id');
  });

  it('should extract client.clientSecret from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['client', 'clientSecret']);

    expect(result).toBe('test-client-secret');
  });

  it('should extract client.redirectUri from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['client', 'redirectUri']);

    expect(result).toBe('https://example.com/callback');
  });

  it('should extract client.idTokenSignedResponseAlg from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['client', 'idTokenSignedResponseAlg']);

    expect(result).toBe('RS256');
  });

  it('should extract server.name from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['server', 'name']);

    expect(result).toBe('Test Server');
  });

  it('should extract server.issuer from config', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    const result = fromFederationConfig(['server', 'issuer']);

    expect(result).toBe('https://test-server.com');
  });

  it('should return null for unknown path', () => {
    const fromFederationConfig = createFromFederationConfig(mockConfig);
    // @ts-expect-error - Testing invalid path
    const result = fromFederationConfig(['unknown']);

    expect(result).toBeNull();
  });

  it('should handle null idTokenSignedResponseAlg', () => {
    const client = mockConfig.client as OidcClientConfig;
    const configWithoutAlg: FederationConfig = {
      id: mockConfig.id,
      protocol: 'oidc',
      client: {
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        redirectUri: client.redirectUri,
        idTokenSignedResponseAlg: null,
      },
      server: mockConfig.server,
    };
    const fromFederationConfig = createFromFederationConfig(configWithoutAlg);
    const result = fromFederationConfig(['client', 'idTokenSignedResponseAlg']);

    expect(result).toBeNull();
  });
});

