import { describe, it, expect, vi } from 'vitest';
import { Result } from '@vecrea/oid4vc-core/utils';
import { ResponseError } from '../ResponseError';
import { defaultResponseFactory } from '../responseFactory';
import { createRecoverResponseResult } from '../recoverResponseResult';
import { toErrorJson } from '@vecrea/au3te-ts-common/utils';
import { BadRequestError } from '@vecrea/au3te-ts-common/handler';

describe('createRecoverResponseResult', () => {
  // Mock the processError function
  const mockProcessError = vi.fn();

  // Create a sample successful response
  const successResponse = new Response('Success', { status: 200 });

  it('should return the original response for successful results', async () => {
    const recoverResponse = createRecoverResponseResult({
      processError: mockProcessError,
      responseFactory: defaultResponseFactory,
    });
    const result = Result.success(successResponse);

    const response = await recoverResponse('path', result);

    expect(response).toBe(successResponse);
    expect(mockProcessError).not.toHaveBeenCalled();
  });

  it('should handle ResponseError and return its response', async () => {
    const recoverResponse = createRecoverResponseResult({
      processError: mockProcessError,
      responseFactory: defaultResponseFactory,
    });
    const errorResponse = new Response('Error', { status: 400 });
    const responseError = new ResponseError('Test error', errorResponse);
    const result = Result.failure<Response>(responseError);

    const response = await recoverResponse('path', result);

    expect(response).toBe(errorResponse);
    expect(mockProcessError).toHaveBeenCalledWith('path', responseError);
  });

  it('should handle BadRequestError and return a bad request response', async () => {
    const recoverResponse = createRecoverResponseResult({
      processError: mockProcessError,
      responseFactory: defaultResponseFactory,
    });
    const badRequestError = new BadRequestError(
      'invalid_request',
      'Invalid request parameter'
    );
    const result = Result.failure<Response>(badRequestError);

    const spy = vi
      .spyOn(defaultResponseFactory, 'badRequest')
      .mockReturnValue(new Response('Bad Request', { status: 400 }));

    const response = await recoverResponse('path', result);

    expect(response.status).toBe(400);
    expect(mockProcessError).toHaveBeenCalledWith('path', badRequestError);
    expect(spy).toHaveBeenCalledWith(
      '{"error":"invalid_request","error_description":"Invalid request parameter"}'
    );
  });

  it('should handle generic errors and return an internal server error response', async () => {
    const recoverResponse = createRecoverResponseResult({
      processError: mockProcessError,
      responseFactory: defaultResponseFactory,
    });
    const genericError = new Error('Generic error');
    const result = Result.failure<Response>(genericError);

    const spy = vi
      .spyOn(defaultResponseFactory, 'internalServerError')
      .mockReturnValue(new Response('Internal Server Error', { status: 500 }));

    const response = await recoverResponse('path', result);

    expect(response.status).toBe(500);
    expect(mockProcessError).toHaveBeenCalledWith('path', genericError);
    expect(spy).toHaveBeenCalledWith(
      toErrorJson('internal_server_error', 'Generic error')
    );
  });
});
