import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessApiResponse } from '../processApiResponse';
import { StandardIntrospectionResponse } from '@vecrea/au3te-ts-common/schemas.standard-introspection';
import { ResponseFactory, ResponseErrorFactory } from '../../core';

describe('createProcessApiResponse', () => {
  const mockResponseFactory = {
    ok: vi.fn(),
    okIntrospectionJwt: vi.fn(),
  } as unknown as ResponseFactory;

  const mockResponseErrorFactory = {
    badRequestResponseError: vi.fn(),
    internalServerErrorResponseError: vi.fn(),
    unauthorizedResponseError: vi.fn(),
  } as unknown as ResponseErrorFactory;

  const processApiResponse = createProcessApiResponse({
    responseFactory: mockResponseFactory,
    responseErrorFactory: mockResponseErrorFactory,
  } as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle OK action', async () => {
    const apiResponse: StandardIntrospectionResponse = {
      action: 'OK',
      responseContent: '{"active":true}',
    };
    (mockResponseFactory.ok as any).mockReturnValue('ok-response');

    const result = await processApiResponse(apiResponse);

    expect(mockResponseFactory.ok).toHaveBeenCalledWith('{"active":true}');
    expect(result).toBe('ok-response');
  });

  it('should handle JWT action', async () => {
    const apiResponse: StandardIntrospectionResponse = {
      action: 'JWT',
      responseContent: 'jwt-token',
    };
    (mockResponseFactory.okIntrospectionJwt as any).mockReturnValue('jwt-response');

    const result = await processApiResponse(apiResponse);

    expect(mockResponseFactory.okIntrospectionJwt).toHaveBeenCalledWith('jwt-token');
    expect(result).toBe('jwt-response');
  });

  it('should handle BAD_REQUEST action', async () => {
    const apiResponse: StandardIntrospectionResponse = {
      action: 'BAD_REQUEST',
      responseContent: 'error-msg',
    };
    (mockResponseErrorFactory.badRequestResponseError as any).mockReturnValue(new Error('Bad Request'));

    await expect(processApiResponse(apiResponse)).rejects.toThrow('Bad Request');
    expect(mockResponseErrorFactory.badRequestResponseError).toHaveBeenCalledWith('error-msg');
  });

  it('should handle INTERNAL_SERVER_ERROR action', async () => {
    const apiResponse: StandardIntrospectionResponse = {
      action: 'INTERNAL_SERVER_ERROR',
      responseContent: 'error-msg',
    };
    (mockResponseErrorFactory.internalServerErrorResponseError as any).mockReturnValue(new Error('Internal Server Error'));

    await expect(processApiResponse(apiResponse)).rejects.toThrow('Internal Server Error');
    expect(mockResponseErrorFactory.internalServerErrorResponseError).toHaveBeenCalledWith('error-msg');
  });

  it('should handle unknown action (default to unauthorized)', async () => {
    const apiResponse: StandardIntrospectionResponse = {
      action: 'UNKNOWN' as any,
    };
    (mockResponseErrorFactory.unauthorizedResponseError as any).mockReturnValue(new Error('Unauthorized'));

    await expect(processApiResponse(apiResponse)).rejects.toThrow('Unauthorized');
    expect(mockResponseErrorFactory.unauthorizedResponseError).toHaveBeenCalled();
  });
});

