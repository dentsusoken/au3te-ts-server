import { describe, it, expect } from 'vitest';
import { TokenCreateHandlerConfigurationImpl } from '../TokenCreateHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '@/handler/core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('TokenCreateHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    tokenCreatePath: '/token/create',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new TokenCreateHandlerConfigurationImpl(mockServerConfig);

    expect(config.path).toBe('/api/token/create');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
  });
});
