import { describe, it, expect, vi } from 'vitest';
import { CredentialIssuerJwksResponse } from '@vecrea/au3te-ts-common/schemas.credential-issuer-jwks';
import { createProcessApiResponse } from '../processApiResponse';
import { defaultResponseFactory } from '../../core/responseFactory';
import { createResponseErrorFactory } from '../../core/responseErrorFactory';
import { ResponseError } from '../../core/ResponseError';

describe('createProcessApiResponse', () => {
  const mockBuildUnknownActionMessage = vi.fn(
    (path, action) => `Unknown action: ${action} at ${path}`
  );

  const responseErrorFactory = createResponseErrorFactory(
    defaultResponseFactory
  );

  const processApiResponse = createProcessApiResponse({
    path: '/test-path',
    responseFactory: defaultResponseFactory,
    responseErrorFactory,
    buildUnknownActionMessage: mockBuildUnknownActionMessage,
  });

  it('should handle OK action', async () => {
    const apiResponse = {
      action: 'OK',
      responseContent: 'Ok content',
    } as CredentialIssuerJwksResponse;
    const response = await processApiResponse(apiResponse);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('Ok content');
  });

  it('should handle NOT_FOUND action', async () => {
    const apiResponse = {
      action: 'NOT_FOUND',
      responseContent: 'Not found content',
    } as CredentialIssuerJwksResponse;
    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError('Not found content', expect.any(Response))
    );
  });

  it('should handle INTERNAL_SERVER_ERROR action', async () => {
    const apiResponse = {
      action: 'INTERNAL_SERVER_ERROR',
      responseContent: 'Internal server error content',
    } as CredentialIssuerJwksResponse;
    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError('Internal server error content', expect.any(Response))
    );
  });

  it('should handle unknown action', async () => {
    const apiResponse = {
      action: 'UNKNOWN_ACTION',
    } as unknown as CredentialIssuerJwksResponse;
    await expect(processApiResponse(apiResponse)).rejects.toThrow(
      new ResponseError(
        'Unknown action: UNKNOWN_ACTION at /test-path',
        expect.any(Response)
      )
    );
    expect(mockBuildUnknownActionMessage).toHaveBeenCalledWith(
      '/test-path',
      'UNKNOWN_ACTION'
    );
  });
});
