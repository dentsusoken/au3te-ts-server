import { describe, it, expect } from 'vitest';
import { TokenFailHandlerConfigurationImpl } from '../TokenFailHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('TokenFailHandlerConfigurationImpl', () => {
  const mockApiClient = {
    tokenFailPath: '/token/fail',
  } as ApiClient;

  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new TokenFailHandlerConfigurationImpl(mockServerConfig);

    expect(config.path).toBe('/api/token/fail');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.buildTokenFailError).toBeDefined();
  });
});
