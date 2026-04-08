import { describe, it, expect } from 'vitest';
import { CredentialIssuerJwksHandlerConfigurationImpl } from '../CredentialIssuerJwksHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('CredentialIssuerJwksHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    credentialIssuerJwksPath: '/api/vci/jwks',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new CredentialIssuerJwksHandlerConfigurationImpl(
      mockServerConfig
    );

    expect(config.path).toBe('/api/vci/jwks');
    expect(config.processApiRequest).toBeDefined();
    expect(config.validateApiResponse).toBeDefined();
    expect(config.processApiRequestWithValidation).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });
});
