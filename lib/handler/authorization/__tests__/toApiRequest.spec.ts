import { describe, it, expect, vi } from 'vitest';
import { createToApiRequest } from '../toApiRequest';

describe('createToApiRequest', () => {
  const mockExtractParameters = vi.fn();

  const toApiRequest = createToApiRequest({
    extractParameters: mockExtractParameters,
  });

  it('should create an AuthorizationRequest from a Request', async () => {
    const mockRequest = {} as Request;

    mockExtractParameters.mockResolvedValue(
      'response_type=code&client_id=client123'
    );

    const result = await toApiRequest(mockRequest);

    expect(result).toEqual({
      apiRequest: {
        parameters: 'response_type=code&client_id=client123',
      },
    });

    expect(mockExtractParameters).toHaveBeenCalledWith(mockRequest);
  });
});
