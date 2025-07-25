import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createComputeHtu } from '../computeHtu';
import { defaultResponseFactory } from '../../core/responseFactory';
import { createResponseErrorFactory } from '../../core/responseErrorFactory';

describe('computeHtu', () => {
  // Mock process API request function
  const mockProcessApiRequest = vi.fn();

  // Test endpoint name
  const testEndpointName = 'credential_endpoint';
  const testEndpointValue = 'https://example.com/credentials';

  // Setup mock response
  const mockMetadataResponse = {
    [testEndpointName]: testEndpointValue,
  };

  const responseErrorFactory = createResponseErrorFactory(
    defaultResponseFactory
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when dpop is not provided', async () => {
    const computeHtu = createComputeHtu({
      processCredentialIssuerMetadataRequestWithValidation:
        mockProcessApiRequest,
    });

    const result = await computeHtu(undefined, testEndpointName);
    expect(result).toBeUndefined();
    expect(mockProcessApiRequest).not.toHaveBeenCalled();
  });

  it('should return endpoint value from metadata when dpop is provided', async () => {
    mockProcessApiRequest.mockResolvedValueOnce({
      action: 'OK',
      responseContent: JSON.stringify(mockMetadataResponse),
    });

    const computeHtu = createComputeHtu({
      processCredentialIssuerMetadataRequestWithValidation:
        mockProcessApiRequest,
    });

    const result = await computeHtu('dummy-dpop-token', testEndpointName);
    expect(result).toBe(testEndpointValue);
    expect(mockProcessApiRequest).toHaveBeenCalledWith({});
  });

  it('should throw error when API response is not OK', async () => {
    const errorContent = 'API Error';
    const errorResponse = responseErrorFactory.internalServerErrorResponseError(
      JSON.stringify({ error: errorContent })
    );
    mockProcessApiRequest.mockRejectedValueOnce(errorResponse);

    const computeHtu = createComputeHtu({
      processCredentialIssuerMetadataRequestWithValidation:
        mockProcessApiRequest,
    });

    await expect(
      computeHtu('dummy-dpop-token', testEndpointName)
    ).rejects.toEqual(errorResponse);
  });

  it('should return undefined when endpoint is not found in metadata', async () => {
    mockProcessApiRequest.mockResolvedValueOnce({
      action: 'OK',
      responseContent: JSON.stringify({}),
    });

    const computeHtu = createComputeHtu({
      processCredentialIssuerMetadataRequestWithValidation:
        mockProcessApiRequest,
    });

    const result = await computeHtu(
      'dummy-dpop-token',
      'non_existent_endpoint'
    );
    expect(result).toBeUndefined();
  });
});
