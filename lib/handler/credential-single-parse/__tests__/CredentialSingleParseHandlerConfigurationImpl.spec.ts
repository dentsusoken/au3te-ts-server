import { describe, it, expect } from 'vitest';
import { CredentialSingleParseHandlerConfigurationImpl } from '../CredentialSingleParseHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { DefaultSessionSchemas } from '@/session';

describe('CredentialSingleParseHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    credentialSingleParsePath: '/api/credential/single/parse',
  } as ApiClient;

  // Use SessionSchemas as the type parameter
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as ServerHandlerConfiguration<DefaultSessionSchemas>;

  it('should initialize with required properties', () => {
    const config = new CredentialSingleParseHandlerConfigurationImpl(
      mockServerConfig
    );

    expect(config.path).toBe('/api/credential/single/parse');
    expect(config.processApiRequest).toBeDefined();
    expect(config.validateApiResponse).toBeDefined();
    expect(config.processApiRequestWithValidation).toBeDefined();
  });
});
