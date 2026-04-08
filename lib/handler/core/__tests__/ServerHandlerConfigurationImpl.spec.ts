import { describe, it, expect } from 'vitest';
import { CommonHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler';
import { ServerHandlerConfigurationImpl } from '../ServerHandlerConfigurationImpl';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { Session } from '../../../session/Session';
import { defaultPrepareHeaders } from '../prepareHeaders';
import { defaultResponseFactory } from '../responseFactory';
import { DefaultSessionSchemas } from '@/session';

// Mock ApiClient and Session
const mockApiClient = {
  pushAuthorizationRequestPath: 'pushAuthorizationRequestPath',
} as ApiClient;
const mockSession = {} as Session<DefaultSessionSchemas>;

describe('ServerHandlerConfigurationImpl', () => {
  // Test constructor
  it('should correctly initialize with provided ApiClient and Session', () => {
    const config = new ServerHandlerConfigurationImpl(
      mockApiClient,
      mockSession
    );

    // Check if apiClient and session are correctly set
    expect(config.apiClient).toBe(mockApiClient);
    expect(config.session).toBe(mockSession);
    expect(config.recoverResponseResult).toBeDefined();
    expect(config.prepareHeaders).toBe(defaultPrepareHeaders);
    expect(config.responseFactory).toBe(defaultResponseFactory);
    expect(config.responseErrorFactory).toBeDefined();
  });

  // Test inheritance
  it('should inherit from CommonHandlerConfigurationImpl', () => {
    const config = new ServerHandlerConfigurationImpl(
      mockApiClient,
      mockSession
    );

    // Check if it's an instance of CommonHandlerConfigurationImpl
    expect(config).toBeInstanceOf(CommonHandlerConfigurationImpl);
  });

  // Test responseFactory initialization
  it('should initialize responseFactory with defaultResponseFactory', () => {
    const config = new ServerHandlerConfigurationImpl(
      mockApiClient,
      mockSession
    );

    expect(config.responseFactory).toBe(defaultResponseFactory);
  });

  // Test responseErrorFactory initialization
  it('should initialize responseErrorFactory with createResponseErrorFactory', () => {
    const config = new ServerHandlerConfigurationImpl(
      mockApiClient,
      mockSession
    );

    expect(config.responseErrorFactory).toBeDefined();
    expect(typeof config.responseErrorFactory.badRequestResponseError).toBe(
      'function'
    );
    expect(
      typeof config.responseErrorFactory.internalServerErrorResponseError
    ).toBe('function');
    expect(typeof config.responseErrorFactory.notFoundResponseError).toBe(
      'function'
    );
    expect(typeof config.responseErrorFactory.unauthorizedResponseError).toBe(
      'function'
    );
    expect(typeof config.responseErrorFactory.forbiddenResponseError).toBe(
      'function'
    );
  });

  // Test recoverResponseResult initialization
  it('should initialize recoverResponseResult with createRecoverResponseResult', () => {
    const config = new ServerHandlerConfigurationImpl(
      mockApiClient,
      mockSession
    );

    expect(config.recoverResponseResult).toBeDefined();
    expect(typeof config.recoverResponseResult).toBe('function');
  });
});
