import { describe, it, expect } from 'vitest';
import { ParHandlerConfigurationImpl } from '../ParHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { Session } from '../../../session/Session';
import { defaultSessionSchemas } from '../../../session/sessionSchemas';
import { ExtractorConfigurationImpl } from '../../../extractor/ExtractorConfigurationImpl';

describe('ParHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    pushAuthorizationRequestPath: '/par',
  } as ApiClient;

  // Mock Session
  const mockSession = {} as Session<typeof defaultSessionSchemas>;

  // Create a mock BaseHandlerConfiguration
  const mockServerConfig = {
    apiClient: mockApiClient,
    session: mockSession,
  } as ServerHandlerConfiguration<typeof defaultSessionSchemas>;

  // Create ExtractorConfiguration instance
  const extractorConfiguration = new ExtractorConfigurationImpl();

  it('should initialize with all required properties', () => {
    const config = new ParHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration,
    });

    expect(config.path).toBe('/api/par');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });
});
