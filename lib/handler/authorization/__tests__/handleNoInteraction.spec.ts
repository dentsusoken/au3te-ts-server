import { describe, it, expect, vi, afterEach } from 'vitest';
import { createHandleNoInteraction } from '../handleNoInteraction';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { Session } from '../../../session/Session';
import { User } from '@vecrea/au3te-ts-common/schemas.common';
import { DefaultSessionSchemas } from '@/session';

// Mock dependencies
const mockCheckAuthAge = vi.fn();
const mockCheckSubject = vi.fn();
const mockCalcSub = vi.fn();
const mockBuildAuthorizationFailError = vi.fn();
const mockHandle4AuthorizationIssue = vi.fn();

describe('handleNoInteraction', () => {
  const handleNoInteraction = createHandleNoInteraction({
    checkAuthAge: mockCheckAuthAge,
    checkSubject: mockCheckSubject,
    calcSub: mockCalcSub,
    buildAuthorizationFailError: mockBuildAuthorizationFailError,
    handle4AuthorizationIssue: mockHandle4AuthorizationIssue,
  });

  // Mock AuthorizationResponse and BaseSession
  const mockResponse: AuthorizationResponse = {
    action: 'NO_INTERACTION',
    ticket: 'test-ticket',
    client: { clientId: 'test-client' },
    subject: 'test-subject',
  };
  const mockUser = { subject: 'test-subject' } as unknown as User;
  const mockAuthTime = 1234567890;
  const mockGetBatch = vi.fn();
  const mockSession = {
    getBatch: mockGetBatch,
  } as unknown as Session<DefaultSessionSchemas>;

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle successful no-interaction flow', async () => {
    // Setup mock return values
    mockGetBatch.mockResolvedValue({
      user: mockUser,
      authTime: mockAuthTime,
    });
    mockCheckAuthAge.mockReturnValue(false);
    mockCheckSubject.mockReturnValue(false);
    mockCalcSub.mockResolvedValue('calculated-sub');
    const mockResult = new Response('success-response');
    mockHandle4AuthorizationIssue.mockResolvedValue(mockResult);

    const result = await handleNoInteraction(mockResponse, mockSession);

    // Assertions
    expect(result).toBe(mockResult);
    expect(mockSession.getBatch).toHaveBeenCalledWith('user', 'authTime');
    expect(mockCheckAuthAge).toHaveBeenCalledWith(
      mockAuthTime,
      mockResponse.maxAge
    );
    expect(mockCheckSubject).toHaveBeenCalledWith(
      mockResponse.subject,
      mockUser.subject
    );
    expect(mockCalcSub).toHaveBeenCalledWith(
      'test-subject',
      mockResponse.client
    );
    expect(mockHandle4AuthorizationIssue).toHaveBeenCalledWith({
      ticket: 'test-ticket',
      subject: 'test-subject',
      authTime: 1234567890,
      sub: 'calculated-sub',
    });
  });

  it('should throw error when user is not logged in', async () => {
    mockGetBatch.mockResolvedValue({
      user: undefined,
      authTime: undefined,
    });
    mockBuildAuthorizationFailError.mockResolvedValue(
      new Error('NOT_LOGGED_IN')
    );

    await expect(
      handleNoInteraction(mockResponse, mockSession)
    ).rejects.toThrow('NOT_LOGGED_IN');
    expect(mockBuildAuthorizationFailError).toHaveBeenCalledWith(
      'test-ticket',
      'NOT_LOGGED_IN'
    );
  });

  it('should throw error when auth age check fails', async () => {
    mockGetBatch.mockResolvedValue({
      user: mockUser,
      authTime: mockAuthTime,
    });
    mockCheckAuthAge.mockReturnValue(true);
    mockBuildAuthorizationFailError.mockResolvedValue(
      new Error('EXCEEDS_MAX_AGE')
    );

    await expect(
      handleNoInteraction(mockResponse, mockSession)
    ).rejects.toThrow('EXCEEDS_MAX_AGE');
    expect(mockBuildAuthorizationFailError).toHaveBeenCalledWith(
      'test-ticket',
      'EXCEEDS_MAX_AGE'
    );
  });

  it('should throw error when subject check fails', async () => {
    mockGetBatch.mockResolvedValue({
      user: mockUser,
      authTime: mockAuthTime,
    });
    mockCheckAuthAge.mockReturnValue(false);
    mockCheckSubject.mockReturnValue(true);
    mockBuildAuthorizationFailError.mockResolvedValue(
      new Error('DIFFERENT_SUBJECT')
    );

    await expect(
      handleNoInteraction(mockResponse, mockSession)
    ).rejects.toThrow('DIFFERENT_SUBJECT');
    expect(mockBuildAuthorizationFailError).toHaveBeenCalledWith(
      'test-ticket',
      'DIFFERENT_SUBJECT'
    );
  });
});
