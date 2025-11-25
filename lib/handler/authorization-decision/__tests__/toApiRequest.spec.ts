import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createToApiRequest } from '../toApiRequest';
import { Session } from '../../../session/Session';
import { defaultSessionSchemas } from '../../../session/sessionSchemas';
import { createResponseErrorFactory } from '../../core/responseErrorFactory';
import { defaultResponseFactory } from '../../core/responseFactory';

describe('createToApiRequest', () => {
  // Mock dependencies
  const mockSession = {
    deleteBatch: vi.fn(),
  } as unknown as Session<typeof defaultSessionSchemas>;

  const mockDeleteBatch = vi.mocked(mockSession.deleteBatch);
  const mockExtractParameters = vi.fn();
  const mockGetOrAuthenticateUser = vi.fn();
  const mockBuildAuthorizationFailError = vi.fn();
  const mockCalcSub = vi.fn();
  const mockCollectClaims = vi.fn();

  const responseErrorFactory = createResponseErrorFactory(
    defaultResponseFactory
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create valid AuthorizationIssueRequest when all required data is present', async () => {
    // Setup mock data
    const mockAuthDecisionParams = {
      ticket: 'test-ticket',
      claimNames: ['email'],
      requestedClaimsForTx: ['name'],
    };

    const mockUser = {
      subject: 'test-subject',
    };

    mockDeleteBatch.mockResolvedValue({
      authorizationDecisionParams: mockAuthDecisionParams,
      acrs: ['acr1'],
      client: { clientId: 'test-client' },
    });

    mockExtractParameters.mockResolvedValue('authorized=true');
    mockGetOrAuthenticateUser.mockResolvedValue({
      user: mockUser,
      authTime: 123456789,
    });
    mockCalcSub.mockResolvedValue('calculated-sub');
    mockCollectClaims
      .mockReturnValueOnce({ email: 'test@example.com' })
      .mockReturnValueOnce({ name: 'Test User' });

    const toApiRequest = createToApiRequest({
      session: mockSession,
      responseErrorFactory,
      extractParameters: mockExtractParameters,
      getOrAuthenticateUser: mockGetOrAuthenticateUser,
      buildAuthorizationFailError: mockBuildAuthorizationFailError,
      calcSub: mockCalcSub,
      collectClaims: mockCollectClaims,
    });

    const request = new Request('https://example.com');
    const result = await toApiRequest(request);

    // Verify the result
    expect(result).toEqual({
      ticket: 'test-ticket',
      subject: 'test-subject',
      authTime: 123456789,
      acr: 'acr1',
      sub: 'calculated-sub',
      claims: JSON.stringify({ email: 'test@example.com' }),
      claimsForTx: JSON.stringify({ name: 'Test User' }),
    });
  });

  it('should throw error when authorization decision params are missing', async () => {
    mockDeleteBatch.mockResolvedValue({
      authorizationDecisionParams: undefined,
      acrs: [],
      client: undefined,
    });

    const toApiRequest = createToApiRequest({
      session: mockSession,
      responseErrorFactory,
      extractParameters: mockExtractParameters,
      getOrAuthenticateUser: mockGetOrAuthenticateUser,
      buildAuthorizationFailError: mockBuildAuthorizationFailError,
      calcSub: mockCalcSub,
      collectClaims: mockCollectClaims,
    });

    const request = new Request('https://example.com');

    await expect(toApiRequest(request)).rejects.toThrow(
      'Authorization decision session data not found'
    );
  });

  it('should throw error when authorization is denied', async () => {
    mockDeleteBatch.mockResolvedValue({
      authorizationDecisionParams: { ticket: 'test-ticket' },
      acrs: [],
      client: undefined,
    });

    mockExtractParameters.mockResolvedValue('');
    mockBuildAuthorizationFailError.mockResolvedValue(
      new Error('Authorization denied')
    );

    const toApiRequest = createToApiRequest({
      session: mockSession,
      responseErrorFactory,
      extractParameters: mockExtractParameters,
      getOrAuthenticateUser: mockGetOrAuthenticateUser,
      buildAuthorizationFailError: mockBuildAuthorizationFailError,
      calcSub: mockCalcSub,
      collectClaims: mockCollectClaims,
    });

    const request = new Request('https://example.com');

    await expect(toApiRequest(request)).rejects.toThrow('Authorization denied');
    expect(mockBuildAuthorizationFailError).toHaveBeenCalled();
  });

  it('should throw error when user is not authenticated', async () => {
    mockDeleteBatch.mockResolvedValue({
      authorizationDecisionParams: { ticket: 'test-ticket' },
      acrs: [],
      client: undefined,
    });

    mockExtractParameters.mockResolvedValue('authorized=true');
    mockGetOrAuthenticateUser.mockResolvedValue({
      user: undefined,
      authTime: undefined,
    });

    mockBuildAuthorizationFailError.mockResolvedValue(
      new Error('User not authenticated')
    );

    const toApiRequest = createToApiRequest({
      session: mockSession,
      responseErrorFactory,
      extractParameters: mockExtractParameters,
      getOrAuthenticateUser: mockGetOrAuthenticateUser,
      buildAuthorizationFailError: mockBuildAuthorizationFailError,
      calcSub: mockCalcSub,
      collectClaims: mockCollectClaims,
    });

    const request = new Request('https://example.com');

    await expect(toApiRequest(request)).rejects.toThrow(
      'User not authenticated'
    );
    expect(mockBuildAuthorizationFailError).toHaveBeenCalled();
  });
});
