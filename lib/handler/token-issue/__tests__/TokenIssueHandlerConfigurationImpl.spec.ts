import { describe, it, expect } from 'vitest';
import { TokenIssueHandlerConfigurationImpl } from '../TokenIssueHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('TokenIssueHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    tokenIssuePath: '/token/issue',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new TokenIssueHandlerConfigurationImpl(mockServerConfig);

    expect(config.path).toBe('/api/token/issue');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
  });
});
