import { describe, it, expect } from 'vitest';
import { AuthorizationIssueHandlerConfigurationImpl } from '../AuthorizationIssueHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('AuthorizationFailHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    authorizationIssuePath: '/authorization-issue',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new AuthorizationIssueHandlerConfigurationImpl(
      mockServerConfig
    );

    expect(config.path).toBe('/api/authorization/issue');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
  });
});
