import { describe, it, expect } from 'vitest';
import { ServiceJwksHandlerConfigurationImpl } from '../ServiceJwksHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('ServiceJwksHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    serviceJwksPath: '/api/jwks',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new ServiceJwksHandlerConfigurationImpl(mockServerConfig);

    expect(config.path).toBe('/api/jwks');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });
});
