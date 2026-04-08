import { describe, it, expect } from 'vitest';
import { IntrospectionHandlerConfigurationImpl } from '../IntrospectionHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('IntrospectionHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    introspectionPath: '/api/auth/introspection',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new IntrospectionHandlerConfigurationImpl(mockServerConfig);

    expect(config.path).toBe('/api/introspection');
    expect(config.processApiRequest).toBeDefined();
    expect(config.validateApiResponse).toBeDefined();
    expect(config.processApiRequestWithValidation).toBeDefined();
  });
});
