import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessApiResponse } from '../processApiResponse';
import { ClientRegistrationResponse } from '@vecrea/au3te-ts-common/schemas.client-registration';
import { ResponseFactory } from '../../core/responseFactory';
import { ResponseErrorFactory } from '../../core/responseErrorFactory';
import { ResponseError } from '@/handler/core';

describe('createProcessApiResponse', () => {
  const mockResponseFactory = {
    ok: vi.fn(),
    created: vi.fn(),
    noContent: vi.fn(),
  } as unknown as ResponseFactory;

  const mockResponseErrorFactory = {
    unauthorizedResponseError: vi.fn(),
    badRequestResponseError: vi.fn(),
    internalServerErrorResponseError: vi.fn(),
  } as unknown as ResponseErrorFactory;

  const processApiResponse = createProcessApiResponse({
    path: '/test',
    buildUnknownActionMessage: () => 'unknown action',
    responseFactory: mockResponseFactory,
    responseErrorFactory: mockResponseErrorFactory,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle OK action', async () => {
    const response = { action: 'OK', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    await processApiResponse(response);
    expect(mockResponseFactory.ok).toHaveBeenCalledWith('content');
  });

  it('should handle CREATED action', async () => {
    const response = { action: 'CREATED', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    await processApiResponse(response);
    expect(mockResponseFactory.created).toHaveBeenCalledWith('content');
  });

  it('should handle UPDATED action', async () => {
    const response = { action: 'UPDATED', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    await processApiResponse(response);
    expect(mockResponseFactory.ok).toHaveBeenCalledWith('content');
  });

  it('should handle DELETED action', async () => {
    const response = { action: 'DELETED', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    await processApiResponse(response);
    expect(mockResponseFactory.noContent).toHaveBeenCalled();
  });

  it('should handle UNAUTHORIZED action', async () => {
    const response = { action: 'UNAUTHORIZED', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    const error = new Error('unauthorized');
    vi.mocked(mockResponseErrorFactory.unauthorizedResponseError).mockReturnValue(error as unknown as ResponseError) as unknown as ResponseError;

    await expect(processApiResponse(response)).rejects.toThrow(error);
    expect(mockResponseErrorFactory.unauthorizedResponseError).toHaveBeenCalledWith('content');
  });

  it('should handle BAD_REQUEST action', async () => {
    const response = { action: 'BAD_REQUEST', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    const error = new Error('bad request');
    vi.mocked(mockResponseErrorFactory.badRequestResponseError).mockReturnValue(error as unknown as ResponseError) as unknown as ResponseError;

    await expect(processApiResponse(response)).rejects.toThrow(error);
    expect(mockResponseErrorFactory.badRequestResponseError).toHaveBeenCalledWith('content');
  });

  it('should handle INTERNAL_SERVER_ERROR action', async () => {
    const response = { action: 'INTERNAL_SERVER_ERROR', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    const error = new Error('internal server error');
    vi.mocked(mockResponseErrorFactory.internalServerErrorResponseError).mockReturnValue(error as unknown as ResponseError) as unknown as ResponseError;

    await expect(processApiResponse(response)).rejects.toThrow(error);
    expect(mockResponseErrorFactory.internalServerErrorResponseError).toHaveBeenCalledWith('content');
  });

  it('should handle default action (UNKNOWN)', async () => {
    const response = { action: 'UNKNOWN', responseContent: 'content' } as unknown as ClientRegistrationResponse;
    const error = new Error('default unauthorized');
    vi.mocked(mockResponseErrorFactory.unauthorizedResponseError).mockReturnValue(error as unknown as ResponseError) as unknown as ResponseError;

    await expect(processApiResponse(response)).rejects.toThrow(error);
    expect(mockResponseErrorFactory.unauthorizedResponseError).toHaveBeenCalled();
  });
});

