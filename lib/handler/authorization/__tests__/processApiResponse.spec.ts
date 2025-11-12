import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessApiResponse } from '../processApiResponse';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { defaultResponseFactory } from '../../core/responseFactory';
import { createResponseErrorFactory } from '../../core/responseErrorFactory';
import { ResponseError } from '../../core/ResponseError';
import { Session } from '../../../session/Session';
import { SessionSchemas } from '../../../session/types';
import { ApiResponseWithOptions } from '../../core/types';

// Mock dependencies
const mockSession = {} as Session<SessionSchemas>;
const mockGenerateAuthorizationPage = vi.fn();
const mockHandleNoInteraction = vi.fn();
const mockBuildUnknownActionMessage = vi.fn();
const mockPath = '/';

describe('createProcessApiResponse', () => {
  const responseErrorFactory = createResponseErrorFactory(
    defaultResponseFactory
  );

  const processApiResponse = createProcessApiResponse({
    session: mockSession,
    path: mockPath,
    responseFactory: defaultResponseFactory,
    responseErrorFactory,
    generateAuthorizationPage: mockGenerateAuthorizationPage,
    handleNoInteraction: mockHandleNoInteraction,
    buildUnknownActionMessage: mockBuildUnknownActionMessage,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test cases for each action
  it('should handle INTERNAL_SERVER_ERROR action', async () => {
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: {
        action: 'INTERNAL_SERVER_ERROR',
        responseContent: 'Internal Server Error',
      },
    };

    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError('Internal Server Error', expect.any(Response))
    );
  });

  it('should handle BAD_REQUEST action', async () => {
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: {
        action: 'BAD_REQUEST',
        responseContent: 'Bad Request',
      },
    };

    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError('Bad Request', expect.any(Response))
    );
  });

  it('should handle LOCATION action', async () => {
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: {
        action: 'LOCATION',
        responseContent: 'https://example.com',
      },
    };
    const spy = vi.spyOn(defaultResponseFactory, 'location');

    const result = await processApiResponse(apiResponse);

    expect(spy).toHaveBeenCalledWith('https://example.com');
    expect(result).toBeInstanceOf(Response);
  });

  it('should handle FORM action', async () => {
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: {
        action: 'FORM',
        responseContent: '<form>...</form>',
      },
    };
    const spy = vi.spyOn(defaultResponseFactory, 'form');

    const result = await processApiResponse(apiResponse);

    expect(spy).toHaveBeenCalledWith('<form>...</form>');
    expect(result).toBeInstanceOf(Response);
  });

  it('should handle INTERACTION action', async () => {
    const authorizationResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      responseContent: undefined,
    };
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: authorizationResponse,
    };

    await processApiResponse(apiResponse);

    expect(mockGenerateAuthorizationPage).toHaveBeenCalledWith(
      authorizationResponse,
      mockSession
    );
  });

  it('should handle NO_INTERACTION action', async () => {
    const authorizationResponse: AuthorizationResponse = {
      action: 'NO_INTERACTION',
      responseContent: undefined,
    };
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: authorizationResponse,
    };

    await processApiResponse(apiResponse);

    expect(mockHandleNoInteraction).toHaveBeenCalledWith(
      authorizationResponse,
      mockSession
    );
  });

  it('should handle unknown action', async () => {
    const authorizationResponse = {
      action: 'UNKNOWN_ACTION',
      responseContent: undefined,
    } as unknown as AuthorizationResponse;
    const apiResponse: ApiResponseWithOptions<AuthorizationResponse, undefined> = {
      apiResponse: authorizationResponse,
    };
    mockBuildUnknownActionMessage.mockReturnValue('Unknown action message');

    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError('Unknown action message', expect.any(Response))
    );

    expect(mockBuildUnknownActionMessage).toHaveBeenCalledWith(
      mockPath,
      'UNKNOWN_ACTION'
    );
  });
});
