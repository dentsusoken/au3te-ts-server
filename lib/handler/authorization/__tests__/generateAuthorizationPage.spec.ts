import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGenerateAuthorizationPage } from '../generateAuthorizationPage';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { Session } from '../../../session/Session';
import { sessionSchemas } from '../../../session/sessionSchemas';

// Mock dependencies
vi.mock('@vecrea/au3te-ts-common/handler.authorization-page');

describe('createGenerateAuthorizationPage', () => {
  const mockSession = {
    setBatch: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
  } as unknown as Session<typeof sessionSchemas>;
  const mockResponseToDecisionParams = vi.fn();
  const mockClearCurrentUserInfoInSessionIfNecessary = vi.fn();
  const mockBuildResponse = vi.fn();
  const mockBuildAuthorizationPageModel = vi.fn();
  let generateAuthorizationPage: ReturnType<
    typeof createGenerateAuthorizationPage
  >;

  beforeEach(() => {
    vi.clearAllMocks();

    generateAuthorizationPage = createGenerateAuthorizationPage({
      responseToDecisionParams: mockResponseToDecisionParams,
      clearCurrentUserInfoInSessionIfNecessary:
        mockClearCurrentUserInfoInSessionIfNecessary,
      buildAuthorizationPageModel: mockBuildAuthorizationPageModel,
      buildResponse: mockBuildResponse,
    });
  });

  it('should process the authorization response correctly', async () => {
    // Arrange
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      acrs: ['acr1'],
      client: { clientId: 'test-client' },
    };
    const mockDecisionParams = { decision: 'allow' };
    const mockUser = { id: 'user1' };
    const mockModel = { page: 'authorization' };

    mockResponseToDecisionParams.mockReturnValue(mockDecisionParams);
    vi.mocked(mockSession.get).mockResolvedValue(mockUser);
    const mockResponseObject = new Response();
    mockBuildResponse.mockResolvedValue(mockResponseObject);
    mockBuildAuthorizationPageModel.mockReturnValue(mockModel);

    // Act
    const result = await generateAuthorizationPage(mockResponse, mockSession);

    // Assert
    expect(mockSession.setBatch).toHaveBeenCalledWith({
      authorizationDecisionParams: mockDecisionParams,
      acrs: mockResponse.acrs,
      client: mockResponse.client,
    });
    expect(mockClearCurrentUserInfoInSessionIfNecessary).toHaveBeenCalledWith(
      mockResponse,
      mockSession
    );
    expect(mockSession.get).toHaveBeenCalledWith('user');
    expect(mockBuildAuthorizationPageModel).toHaveBeenCalledWith(
      mockResponse,
      mockUser
    );
    expect(mockSession.set).toHaveBeenCalledWith('authorizationPageModel', mockModel);
    expect(mockBuildResponse).toHaveBeenCalledWith(mockModel);
    expect(result).toBe(mockResponseObject);
  });
});
