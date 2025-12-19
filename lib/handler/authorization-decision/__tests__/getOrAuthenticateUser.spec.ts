import { describe, it, expect, vi } from 'vitest';
import { createGetOrAuthenticateUser } from '../getOrAuthenticateUser';
import { Session } from '../../../session/Session';
import { defaultSessionSchemas } from '../../../session/sessionSchemas';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

describe('getOrAuthenticateUser', () => {
  // Mock user data
  const mockUser: User = {
    subject: 'user123',
    name: 'Test User',
    email: 'test@example.com',
  };

  // Mock session
  const createMockSession = (user?: User, authTime?: number) => {
    return {
      getBatch: vi.fn().mockResolvedValue({ user, authTime }),
      setBatch: vi.fn(),
    } as unknown as Session<typeof defaultSessionSchemas>;
  };

  // Mock getByCredentials function
  const mockGetByCredentials = vi.fn();
  const mockCacheUserAttributes = vi.fn();

  it('should return existing user and authTime from session if available', async () => {
    const authTime = Math.floor(Date.now() / 1000);
    const session = createMockSession(mockUser, authTime);
    const getOrAuthenticateUser =
      createGetOrAuthenticateUser(mockGetByCredentials, mockCacheUserAttributes);

    const result = await getOrAuthenticateUser(session, {});

    expect(result).toEqual({ user: mockUser, authTime });
    expect(mockGetByCredentials).not.toHaveBeenCalled();
  });

  it('should return undefined values if no credentials provided', async () => {
    const session = createMockSession();
    const getOrAuthenticateUser =
      createGetOrAuthenticateUser(mockGetByCredentials, mockCacheUserAttributes);

    const result = await getOrAuthenticateUser(session, {});

    expect(result).toEqual({ user: undefined, authTime: undefined });
    expect(mockGetByCredentials).not.toHaveBeenCalled();
  });

  it('should authenticate user with valid credentials and store in session', async () => {
    const session = createMockSession();
    mockGetByCredentials.mockResolvedValue(mockUser);
    const getOrAuthenticateUser =
      createGetOrAuthenticateUser(mockGetByCredentials, mockCacheUserAttributes);

    const parameters = {
      loginId: 'testuser',
      password: 'password123',
    };

    const result = await getOrAuthenticateUser(session, parameters);

    expect(result).toEqual({
      user: mockUser,
      authTime: expect.any(Number),
    });
    expect(mockGetByCredentials).toHaveBeenCalledWith(
      'testuser',
      'password123'
    );
    expect(session.setBatch).toHaveBeenCalledWith({
      user: mockUser,
      authTime: expect.any(Number),
    });
  });

  it('should return undefined values for invalid credentials', async () => {
    const session = createMockSession();
    mockGetByCredentials.mockResolvedValue(undefined);
    const getOrAuthenticateUser =
      createGetOrAuthenticateUser(mockGetByCredentials, mockCacheUserAttributes);

    const parameters = {
      loginId: 'testuser',
      password: 'wrongpassword',
    };

    const result = await getOrAuthenticateUser(session, parameters);

    expect(result).toEqual({ user: undefined, authTime: undefined });
    expect(mockGetByCredentials).toHaveBeenCalledWith(
      'testuser',
      'wrongpassword'
    );
    expect(session.setBatch).not.toHaveBeenCalled();
  });
});
