import { describe, it, expect, vi } from 'vitest';
import { createToApiRequest } from '../toApiRequest';
import { ExtractAccessToken, ExtractParameters, ExtractPathParameter } from '@/extractor';

describe('createToApiRequest', () => {
  const mockExtractParameters = vi.fn();
  const mockExtractAccessToken = vi.fn();
  const mockExtractPathParameter = vi.fn();

  const toApiRequest = createToApiRequest({
    path: '/api/client/:clientId',
    extractParameters: mockExtractParameters as unknown as ExtractParameters,
    extractAccessToken: mockExtractAccessToken as unknown as ExtractAccessToken,
    extractPathParameter: mockExtractPathParameter as unknown as ExtractPathParameter,
  });

  it('should extract parameters correctly', async () => {
    // Arrange
    const request = new Request('http://example.com/api/client/123', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
      body: JSON.stringify({ name: 'test-client' }),
    });

    const mockJson = { name: 'test-client' };
    const mockToken = 'token';
    const mockPathParams = { clientId: '123' };

    mockExtractParameters.mockResolvedValue(mockJson);
    mockExtractAccessToken.mockReturnValue(mockToken);
    mockExtractPathParameter.mockReturnValue(mockPathParams);

    // Act
    const result = await toApiRequest(request);

    // Assert
    expect(mockExtractParameters).toHaveBeenCalledWith(request);
    expect(mockExtractAccessToken).toHaveBeenCalledWith(request);
    expect(mockExtractPathParameter).toHaveBeenCalledWith(request, '/api/client/:clientId');
    expect(result).toEqual({
      json: mockJson,
      token: mockToken,
      clientId: '123',
    });
  });
});

