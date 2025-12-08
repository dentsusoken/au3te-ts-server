import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessApiResponse } from '../processApiResponse';
import { defaultResponseFactory } from '@/handler/core/responseFactory';
import { createResponseErrorFactory } from '@/handler/core/responseErrorFactory';
import { ResponseError } from '@/handler/core/ResponseError';
import { CredentialSingleIssueResponse } from '@vecrea/au3te-ts-common/schemas.credential-single-issue';
import { ApiResponseWithOptions } from '@/handler/core/types';
import { CredentialApiOptions } from '@/handler/credential/types';

// Mock responseFactory methods
vi.mock('@/handler/core/responseFactory', () => ({
  defaultResponseFactory: {
    internalServerError: vi.fn(),
    badRequest: vi.fn(),
    unauthorized: vi.fn(),
    forbidden: vi.fn(),
    ok: vi.fn(),
    okJwt: vi.fn(),
    accepted: vi.fn(),
    acceptedJwt: vi.fn(),
  },
}));

describe('createProcessApiResponse', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock responseFactory methods to return Response objects
    (defaultResponseFactory.badRequest as ReturnType<typeof vi.fn>).mockReturnValue(
      new Response('{"error": "bad_request"}', { status: 400 })
    );
    (defaultResponseFactory.unauthorized as ReturnType<typeof vi.fn>).mockReturnValue(
      new Response('{"error": "unauthorized"}', { status: 401 })
    );
    (defaultResponseFactory.forbidden as ReturnType<typeof vi.fn>).mockReturnValue(
      new Response('{"error": "forbidden"}', { status: 403 })
    );
    (defaultResponseFactory.internalServerError as ReturnType<typeof vi.fn>).mockReturnValue(
      new Response('{"error": "internal_server_error"}', { status: 500 })
    );
  });
  // Mock functions
  const mockBuildUnknownActionMessage = vi.fn();

  // Test path
  const testPath = '/test/path';

  // Common test data
  const mockHeaders = { 'Custom-Header': 'value' };
  const mockAccessToken = 'test_token';
  const mockResponseContent = '{"test":"data"}';
  const mockOptions: CredentialApiOptions = {
    headers: mockHeaders,
    accessToken: mockAccessToken,
  };

  const responseErrorFactory = createResponseErrorFactory(
    defaultResponseFactory
  );

  // Test setup
  const setup = () => {
    return createProcessApiResponse({
      path: testPath,
      responseFactory: defaultResponseFactory,
      responseErrorFactory,
      buildUnknownActionMessage: mockBuildUnknownActionMessage,
    });
  };

  it('should handle CALLER_ERROR action', async () => {
    // Arrange
    const processApiResponse = setup();
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'CALLER_ERROR',
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };

    // Act & Assert
    await expect(processApiResponse(apiResponseWithOptions)).rejects.toThrow(
      new ResponseError(mockResponseContent, expect.any(Response))
    );
  });

  it('should handle BAD_REQUEST action', async () => {
    // Arrange
    const processApiResponse = setup();
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'BAD_REQUEST',
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };

    // Act & Assert
    await expect(processApiResponse(apiResponseWithOptions)).rejects.toThrow(
      new ResponseError(mockResponseContent, expect.any(Response))
    );
  });

  it('should handle UNAUTHORIZED action', async () => {
    // Arrange
    const processApiResponse = setup();
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'UNAUTHORIZED',
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };

    // Act & Assert
    await expect(processApiResponse(apiResponseWithOptions)).rejects.toThrow(
      new ResponseError(mockAccessToken, expect.any(Response))
    );
  });

  it('should handle OK action', async () => {
    // Arrange
    const processApiResponse = setup();
    const mockResponse = new Response('success', { status: 200 });
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'OK',
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };
    vi.mocked(defaultResponseFactory.ok).mockReturnValue(mockResponse);

    // Act
    const result = await processApiResponse(apiResponseWithOptions);

    // Assert
    expect(defaultResponseFactory.ok).toHaveBeenCalledWith(
      mockResponseContent,
      mockHeaders
    );
    expect(result).toBe(mockResponse);
  });

  it('should handle OK_JWT action', async () => {
    // Arrange
    const processApiResponse = setup();
    const mockResponse = new Response('jwt', { status: 200 });
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'OK_JWT',
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };
    vi.mocked(defaultResponseFactory.okJwt).mockReturnValue(mockResponse);

    // Act
    const result = await processApiResponse(apiResponseWithOptions);

    // Assert
    expect(defaultResponseFactory.okJwt).toHaveBeenCalledWith(
      mockResponseContent,
      mockHeaders
    );
    expect(result).toBe(mockResponse);
  });

  it('should handle unknown action', async () => {
    // Arrange
    const processApiResponse = setup();
    const unknownAction = 'UNKNOWN_ACTION';
    const mockErrorMessage = 'Unknown action error';
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: unknownAction as CredentialSingleIssueResponse['action'],
        responseContent: mockResponseContent,
      },
      options: mockOptions,
    };
    mockBuildUnknownActionMessage.mockReturnValue(mockErrorMessage);

    // Act & Assert
    await expect(processApiResponse(apiResponseWithOptions)).rejects.toThrow(
      new ResponseError(mockErrorMessage, expect.any(Response))
    );
    expect(mockBuildUnknownActionMessage).toHaveBeenCalledWith(
      testPath,
      unknownAction
    );
  });

  it('should handle null responseContent for UNAUTHORIZED action', async () => {
    // Arrange
    const processApiResponse = setup();
    const apiResponseWithOptions: ApiResponseWithOptions<
      CredentialSingleIssueResponse,
      CredentialApiOptions
    > = {
      apiResponse: {
        action: 'UNAUTHORIZED',
        responseContent: null,
      },
      options: mockOptions,
    };

    // Act & Assert
    await expect(processApiResponse(apiResponseWithOptions)).rejects.toThrow(
      new ResponseError(mockAccessToken, expect.any(Response))
    );
  });
});
