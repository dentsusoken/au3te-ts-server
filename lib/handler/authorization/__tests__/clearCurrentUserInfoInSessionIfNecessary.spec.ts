import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClearCurrentUserInfoInSessionIfNecessary } from '../clearCurrentUserInfoInSessionIfNecessary';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { Session } from '../../../session/Session';
import { defaultSessionSchemas } from '../../../session/sessionSchemas';

describe('createClearCurrentUserInfoInSessionIfNecessary', () => {
  // Mock dependencies
  const mockCheckPrompts = vi.fn();
  const mockCheckAuthAge = vi.fn();
  const mockClearCurrentUserInfoInSession = vi.fn();
  const mockSession = {
    get: vi.fn(),
  } as unknown as Session<typeof defaultSessionSchemas>;

  const clearCurrentUserInfoInSessionIfNecessary =
    createClearCurrentUserInfoInSessionIfNecessary({
      checkPrompts: mockCheckPrompts,
      checkAuthAge: mockCheckAuthAge,
      clearCurrentUserInfoInSession: mockClearCurrentUserInfoInSession,
    });

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should clear current user info when checkPrompts returns true', async () => {
    // Arrange
    const mockResponse = {} as AuthorizationResponse;
    mockCheckPrompts.mockReturnValue(true);

    // Act
    await clearCurrentUserInfoInSessionIfNecessary(mockResponse, mockSession);

    // Assert
    expect(mockClearCurrentUserInfoInSession).toHaveBeenCalledWith(mockSession);
  });

  it('should clear current user info when checkAuthAge returns true', async () => {
    // Arrange
    const mockResponse = {} as AuthorizationResponse;
    mockCheckPrompts.mockReturnValue(false);
    mockCheckAuthAge.mockReturnValue(true);

    // Act
    await clearCurrentUserInfoInSessionIfNecessary(mockResponse, mockSession);

    // Assert
    expect(mockClearCurrentUserInfoInSession).toHaveBeenCalledWith(mockSession);
  });

  it('should not clear current user info when both checkPrompts and checkAuthAge return false', async () => {
    // Arrange
    const mockResponse = {} as AuthorizationResponse;
    mockCheckPrompts.mockReturnValue(false);
    mockCheckAuthAge.mockReturnValue(false);

    // Act
    await clearCurrentUserInfoInSessionIfNecessary(mockResponse, mockSession);

    // Assert
    expect(mockClearCurrentUserInfoInSession).not.toHaveBeenCalled();
  });

  it('should use 0 as default authTime when session.get returns undefined', async () => {
    // Arrange
    const mockResponse = {} as AuthorizationResponse;
    mockCheckPrompts.mockReturnValue(false);
    mockCheckAuthAge.mockReturnValue(true);
    vi.mocked(mockSession.get).mockResolvedValue(undefined);

    // Act
    await clearCurrentUserInfoInSessionIfNecessary(mockResponse, mockSession);

    // Assert
    expect(mockCheckAuthAge).toHaveBeenCalledWith(0, undefined);
    expect(mockClearCurrentUserInfoInSession).toHaveBeenCalledWith(mockSession);
  });
});
