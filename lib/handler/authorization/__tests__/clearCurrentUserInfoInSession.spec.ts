import { describe, it, expect, vi } from 'vitest';
import { Session } from '../../../session/Session';
import { defaultSessionSchemas } from '../../../session/sessionSchemas';
import { defaultClearCurrentUserInfoInSession } from '../clearCurrentUserInfoInSession';

describe('defaultClearCurrentUserInfoInSession', () => {
  it('should delete user and authTime from the session', async () => {
    // Create a mock BaseSession
    const mockSession = {
      deleteBatch: vi.fn().mockResolvedValue(undefined),
    } as unknown as Session<typeof defaultSessionSchemas>;

    // Call the function
    await defaultClearCurrentUserInfoInSession(mockSession);

    // Check if deleteBatch was called with correct arguments
    expect(mockSession.deleteBatch).toHaveBeenCalledWith('user', 'authTime');
    expect(mockSession.deleteBatch).toHaveBeenCalledTimes(1);
  });
});
