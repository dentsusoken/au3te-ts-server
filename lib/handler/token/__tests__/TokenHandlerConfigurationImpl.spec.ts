import { describe, it, expect } from 'vitest';
import { TokenHandlerConfigurationImpl } from '../TokenHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { TokenFailHandlerConfiguration } from '../../token-fail/TokenFailHandlerConfiguration';
import { TokenIssueHandlerConfiguration } from '../../token-issue/TokenIssueHandlerConfiguration';
import { TokenCreateHandlerConfiguration } from '../../token-create/TokenCreateHandlerConfiguration';
import { ExtractorConfiguration } from '../../../extractor/ExtractorConfiguration';
import { DefaultSessionSchemas } from '@/session';

describe('TokenHandlerConfigurationImpl', () => {
  // Mock API client
  const mockApiClient = {
    tokenPath: '/token',
  } as unknown as ApiClient;

  // Mock base configuration
  const mockServerConfig = {
    apiClient: mockApiClient,
  } as unknown as ServerHandlerConfiguration<DefaultSessionSchemas>;

  // Mock user configuration
  const mockUserConfig = {
    getByCredentials: async () => ({ subject: 'test-subject' }),
  } as unknown as UserHandlerConfiguration;

  // Mock token fail configuration
  const mockTokenFailConfig = {
    buildTokenFailError: () => new Error('token fail'),
  } as unknown as TokenFailHandlerConfiguration;

  // Mock token issue configuration
  const mockTokenIssueConfig = {
    handle: async () => new Response(),
  } as unknown as TokenIssueHandlerConfiguration;

  // Mock token create configuration
  const mockTokenCreateConfig = {
    handle: async () => new Response(),
  } as unknown as TokenCreateHandlerConfiguration;

  // Mock extractor configuration
  const mockExtractorConfig = {
    extractParameters: () => ({}),
    extractClientCredentials: () => ({}),
    extractClientCertificateAndPath: () => ({}),
  } as unknown as ExtractorConfiguration;

  it('should initialize with required properties', () => {
    const config = new TokenHandlerConfigurationImpl({
      serverHandlerConfiguration: mockServerConfig,
      userHandlerConfiguration: mockUserConfig,
      tokenFailHandlerConfiguration: mockTokenFailConfig,
      tokenIssueHandlerConfiguration: mockTokenIssueConfig,
      tokenCreateHandlerConfiguration: mockTokenCreateConfig,
      extractorConfiguration: mockExtractorConfig,
    });

    expect(config.path).toBe('/api/token');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.determineSubject4TokenExchange).toBeDefined();
    expect(config.determineSubject4JwtBearer).toBeDefined();
    expect(config.handlePassword).toBeDefined();
    expect(config.handleTokenExchange).toBeDefined();
    expect(config.handleJwtBearer).toBeDefined();
    expect(config.responseToCreateRequest4TokenExchange).toBeDefined();
    expect(config.responseToCreateRequest4JwtBearer).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });
});
