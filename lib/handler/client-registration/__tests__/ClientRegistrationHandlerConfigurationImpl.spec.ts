import { describe, it, expect, vi } from 'vitest';
import { ClientRegistrationHandlerConfigurationImpl } from '../ClientRegistrationHandlerConfigurationImpl';
import { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import { ExtractorConfiguration } from '../../../extractor/ExtractorConfiguration';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { SessionSchemas } from '../../../session/types';

describe('ClientRegistrationHandlerConfigurationImpl', () => {
  // Mock API Client
  const mockApiClient = {
    clientRegistrationPath: '/api/client/registration',
  } as unknown as ApiClient;

  // Mock Server Handler Configuration
  const mockServerConfig = {
    apiClient: mockApiClient,
    responseFactory: {},
    responseErrorFactory: {},
    buildUnknownActionMessage: vi.fn(),
    recoverResponseResult: vi.fn(),
  } as unknown as ServerHandlerConfiguration<SessionSchemas>;

  // Mock Extractor Configuration
  const mockExtractorConfig = {
    extractParameters: vi.fn(),
    extractAccessToken: vi.fn(),
    extractPathParameter: vi.fn(),
  } as unknown as ExtractorConfiguration;

  it('should initialize with required properties', () => {
    const config = new ClientRegistrationHandlerConfigurationImpl({
      method: 'create',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
    });

    expect(config.path).toBe('/connect/register/:clientId');
    expect(config.processApiRequest).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });

  it('should use overrides when provided', () => {
    const mockCreateToApiRequest = vi.fn().mockReturnValue('mockToApiRequest');
    const mockCreateProcessApiRequest = vi.fn().mockReturnValue('mockProcessApiRequest');
    const mockCreateProcessApiResponse = vi.fn().mockReturnValue('mockProcessApiResponse');
    const mockCreateHandle = vi.fn().mockReturnValue('mockHandle');
    const mockCreateProcessRequest = vi.fn().mockReturnValue('mockProcessRequest');

    const config = new ClientRegistrationHandlerConfigurationImpl({
      method: 'create',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
      overrides: {
        createToApiRequest: mockCreateToApiRequest,
        createProcessApiRequest: mockCreateProcessApiRequest,
        createProcessApiResponse: mockCreateProcessApiResponse,
        createHandle: mockCreateHandle,
        createProcessRequest: mockCreateProcessRequest,
      },
    });

    expect(mockCreateToApiRequest).toHaveBeenCalled();
    expect(mockCreateProcessApiRequest).toHaveBeenCalled();
    expect(mockCreateProcessApiResponse).toHaveBeenCalled();
    expect(mockCreateHandle).toHaveBeenCalled();
    expect(mockCreateProcessRequest).toHaveBeenCalled();
    
    // Check if the overrides result is assigned
    expect(config.toApiRequest).toBe('mockToApiRequest');
    expect(config.processApiRequest).toBe('mockProcessApiRequest');
    expect(config.processApiResponse).toBe('mockProcessApiResponse');
    expect(config.handle).toBe('mockHandle');
    expect(config.processRequest).toBe('mockProcessRequest');
  });

  it('should resolve correct API path for create method', () => {
    const mockCreateProcessApiRequest = vi.fn();
    
    new ClientRegistrationHandlerConfigurationImpl({
      method: 'create',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
      overrides: {
        createProcessApiRequest: mockCreateProcessApiRequest as any,
      },
    });

    // The first argument to createProcessApiRequest should be the resolved path
    expect(mockCreateProcessApiRequest).toHaveBeenCalledWith(
      '/api/client/registration', 
      expect.anything(), 
      expect.anything()
    );
  });

  it('should resolve correct API path for get method', () => {
    const mockCreateProcessApiRequest = vi.fn();
    
    new ClientRegistrationHandlerConfigurationImpl({
      method: 'get',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
      overrides: {
        createProcessApiRequest: mockCreateProcessApiRequest as any,
      },
    });

    expect(mockCreateProcessApiRequest).toHaveBeenCalledWith(
      '/api/client/registration/get', 
      expect.anything(), 
      expect.anything()
    );
  });

  it('should resolve correct API path for update method', () => {
    const mockCreateProcessApiRequest = vi.fn();
    
    new ClientRegistrationHandlerConfigurationImpl({
      method: 'update',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
      overrides: {
        createProcessApiRequest: mockCreateProcessApiRequest as any,
      },
    });

    expect(mockCreateProcessApiRequest).toHaveBeenCalledWith(
      '/api/client/registration/update', 
      expect.anything(), 
      expect.anything()
    );
  });

  it('should resolve correct API path for delete method', () => {
    const mockCreateProcessApiRequest = vi.fn();
    
    new ClientRegistrationHandlerConfigurationImpl({
      method: 'delete',
      serverHandlerConfiguration: mockServerConfig,
      extractorConfiguration: mockExtractorConfig,
      overrides: {
        createProcessApiRequest: mockCreateProcessApiRequest as any,
      },
    });

    expect(mockCreateProcessApiRequest).toHaveBeenCalledWith(
      '/api/client/registration/delete', 
      expect.anything(), 
      expect.anything()
    );
  });
});

