import { describe, it, expect, vi } from 'vitest';
import { AuthorizationHandlerConfigurationImpl } from '../AuthorizationHandlerConfigurationImpl';
import type { AuthorizationHandlerConfigurationImplOverrides } from '../AuthorizationHandlerConfigurationImpl';
import type { SessionSchemas } from '../../../session/types';
import type { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import type { AuthorizationIssueHandlerConfiguration } from '../../authorization-issue/AuthorizationIssueHandlerConfiguration';
import type { AuthorizationFailHandlerConfiguration } from '../../authorization-fail/AuthorizationFailHandlerConfiguration';
import type { AuthorizationPageHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.authorization-page';
import type { ExtractorConfiguration } from '../../../extractor/ExtractorConfiguration';
import type { AuthorizationRequest, AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import type { ProcessApiResponse } from '../../core/processApiResponse';
import type { ProcessApiRequest } from '../../core/processApiRequest';
import type { HandleWithOptions, CreateHandleWithOptionsParams } from '../../core/handleWithOptions';
import type { CreateProcessApiResponseParams4Authorization } from '../processApiResponse';
import type { ApiResponseWithOptions } from '../../core/types';

type TestHandleOptions = {
  traceId: string;
};

const createDependencies = () => {
  const serverHandlerConfiguration = {
    apiClient: {
      authorizationPath: '/api/auth/authorization',
      callPostApi: vi.fn(),
      callGetApi: vi.fn(),
    },
    session: {
      get: vi.fn(),
      getBatch: vi.fn(),
      set: vi.fn(),
      setBatch: vi.fn(),
      delete: vi.fn(),
      deleteBatch: vi.fn(),
      clear: vi.fn(),
    },
    responseFactory: {
      location: vi.fn((location: string) =>
        new Response(null, { status: 302, headers: { Location: location } })
      ),
      form: vi.fn(() => new Response(null, { status: 200 })),
      internalServerError: vi.fn(() => new Response(null, { status: 500 })),
      badRequest: vi.fn(() => new Response(null, { status: 400 })),
    },
    responseErrorFactory: {
      internalServerErrorResponseError: vi.fn((message: string) =>
        new Error(message)
      ),
      badRequestResponseError: vi.fn((message: string) => new Error(message)),
    },
    recoverResponseResult: vi.fn(),
    buildUnknownActionMessage: vi.fn((path: string, action: string) =>
      `${path}:${action}`
    ),
    prepareHeaders: vi.fn(),
  } as unknown as ServerHandlerConfiguration<SessionSchemas>;

  const authorizationIssueHandlerConfiguration = {
    handle: vi.fn(async () => new Response(null, { status: 204 })),
  } as unknown as AuthorizationIssueHandlerConfiguration;

  const authorizationFailHandlerConfiguration = {
    buildAuthorizationFailError: vi.fn(async () => new Error('fail')),
  } as unknown as AuthorizationFailHandlerConfiguration;

  const authorizationPageHandlerConfiguration = {
    buildAuthorizationPageModel: vi.fn(),
  } as unknown as AuthorizationPageHandlerConfiguration;

  const extractorConfiguration = {
    extractParameters: vi.fn(async () => new URLSearchParams()),
  } as unknown as ExtractorConfiguration;

  return {
    serverHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
    authorizationPageHandlerConfiguration,
    extractorConfiguration,
  };
};

const createConfig = (
  overrides?: AuthorizationHandlerConfigurationImplOverrides<
    SessionSchemas,
    TestHandleOptions
  >
) =>
  new AuthorizationHandlerConfigurationImpl<SessionSchemas, TestHandleOptions>({
    ...createDependencies(),
    overrides,
  });

describe('AuthorizationHandlerConfigurationImpl', () => {
  it('should initialize with all required properties', () => {
    // Given default dependencies without overrides
    const config = createConfig();

    // When reading the generated configuration
    // Then all expected members are defined
    expect(config.path).toBe('/api/authorization');
    expect(config.processApiRequest).toBeDefined();
    expect(config.responseToDecisionParams).toBeDefined();
    expect(config.checkPrompts).toBeDefined();
    expect(config.checkAuthAge).toBeDefined();
    expect(config.clearCurrentUserInfoInSession).toBeDefined();
    expect(config.clearCurrentUserInfoInSessionIfNecessary).toBeDefined();
    expect(config.buildResponse).toBeDefined();
    expect(config.generateAuthorizationPage).toBeDefined();
    expect(config.checkSubject).toBeDefined();
    expect(config.calcSub).toBeDefined();
    expect(config.handleNoInteraction).toBeDefined();
    expect(config.processApiResponse).toBeDefined();
    expect(config.handle).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });

  it('should use an overridden createProcessApiRequest implementation', () => {
    // Given an override that decorates processApiRequest creation
    const customProcessApiRequest: ProcessApiRequest<
      AuthorizationRequest,
      AuthorizationResponse
    > = vi.fn();

    const overrides = {
      createProcessApiRequest: vi.fn(() => customProcessApiRequest),
    };

    // When constructing the configuration with the override
    const config = createConfig(overrides);

    // Then the returned processApiRequest matches the custom one
    expect(config.processApiRequest).toBe(customProcessApiRequest);
    expect(overrides.createProcessApiRequest).toHaveBeenCalledOnce();
  });

  it('should forward handle options when a custom handle factory is provided', async () => {
    // Given a createHandle override expecting TestHandleOptions
    const receivedOptions: TestHandleOptions[] = [];
    const createHandleOverride = vi.fn(
      ({
        processApiRequest,
        processApiResponse,
      }: CreateHandleWithOptionsParams<
        AuthorizationRequest,
        AuthorizationResponse,
        TestHandleOptions
      >) => {
        expect(typeof processApiRequest).toBe('function');
        expect(typeof processApiResponse).toBe('function');

        const handle: HandleWithOptions<AuthorizationRequest, TestHandleOptions> = async ({
          apiRequest: _apiRequest,
          options,
        }) => {
          receivedOptions.push(options ?? { traceId: '' });
          return new Response(null, { status: 204 });
        };

        return handle;
      },
    );

    const config = createConfig({ createHandle: createHandleOverride });

    // When invoking handle with explicit options
    const options: TestHandleOptions = { traceId: '' };
    await config.handle({ apiRequest: {} as AuthorizationRequest, options });

    // Then the options are captured by the custom handle
    expect(receivedOptions).toEqual([options]);
    expect(createHandleOverride).toHaveBeenCalledOnce();
  });

  it('should reject when the injected processApiRequest reports invalid input', async () => {
    // Given a processApiRequest override guarding against null input
    const rejection = new TypeError('authorization request is required');
    const failingProcessApiRequest: ProcessApiRequest<
      AuthorizationRequest,
      AuthorizationResponse
    > = vi.fn(async (request) => {
      if (!request) {
        throw rejection;
      }
      return {} as AuthorizationResponse;
    });

    const config = createConfig({ processApiRequest: failingProcessApiRequest });

    // When calling the overridden processApiRequest with an invalid request
    await expect(
      config.processApiRequest(null as unknown as AuthorizationRequest),
    ).rejects.toBe(rejection);

    // Then the override should have been invoked exactly once
    expect(failingProcessApiRequest).toHaveBeenCalledOnce();
  });

  it('should propagate errors thrown by an overridden processApiResponse', async () => {
    // Given a createProcessApiResponse override that always throws
    const rejection = new RangeError('unsupported action');
    const createProcessApiResponseOverride = vi.fn(
      (
        _params: CreateProcessApiResponseParams4Authorization<SessionSchemas, TestHandleOptions>,
      ): ProcessApiResponse<ApiResponseWithOptions<AuthorizationResponse, TestHandleOptions>, TestHandleOptions> =>
        vi.fn(async () => {
          throw rejection;
        }),
    );

    const config = createConfig({
      createProcessApiResponse: createProcessApiResponseOverride,
    });

    // When the overridden processApiResponse is executed
    await expect(
      config.processApiResponse({
        apiResponse: {} as AuthorizationResponse,
      } as ApiResponseWithOptions<AuthorizationResponse, TestHandleOptions>)
    ).rejects.toBe(rejection);

    // Then the factory should have been evaluated once
    expect(createProcessApiResponseOverride).toHaveBeenCalledOnce();
  });

  it('should reject when the custom processRequest factory fails to build a response', async () => {
    // Given a createProcessRequest override that reports malformed request data
    const processRequestError = new Error('invalid request format');
    const createProcessRequestOverride = vi.fn(() =>
      vi.fn(async () => {
        throw processRequestError;
      }),
    );

    const config = createConfig({
      createProcessRequest: createProcessRequestOverride,
    });

    // When invoking processRequest produced by the override
    await expect(
      config.processRequest(new Request('https://example.com/authorize')),
    ).rejects.toBe(processRequestError);

    // Then the override should be called once to supply the failing handler
    expect(createProcessRequestOverride).toHaveBeenCalledOnce();
  });
});
