import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySession } from '../InMemorySession';
import { Session } from '../Session';
import { defaultSessionSchemas } from '../sessionSchemas';

describe('InMemorySession with sessionSchemas', () => {
  let session: Session<typeof defaultSessionSchemas>;

  beforeEach(() => {
    session = new InMemorySession(defaultSessionSchemas);
  });

  it('should set and get user data', async () => {
    const user = { subject: '1' };
    await session.set('user', user);
    const retrievedUser = await session.get('user');
    expect(retrievedUser).toEqual(user);
  });

  it('should set and get authTime', async () => {
    const authTime = Math.floor(Date.now() / 1000);
    await session.set('authTime', authTime);
    const retrievedAuthTime = await session.get('authTime');
    expect(retrievedAuthTime).toBe(authTime);
  });
});
