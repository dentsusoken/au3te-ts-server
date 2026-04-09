import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { KeyedSession } from '../KeyedSession';
import { InMemorySessionStore } from '../InMemorySessionStore';
import { InMemorySession } from '../index';
import { defaultSessionSchemas } from '../sessionSchemas';

describe('KeyedSession', () => {
  let session: KeyedSession<TestSchemas>;

  const testSchemas = {
    user: z.object({
      id: z.string(),
      name: z.string(),
    }),
    count: z.number(),
    isActive: z.boolean(),
  };

  type TestSchemas = typeof testSchemas;

  beforeEach(() => {
    session = new KeyedSession(testSchemas);
  });

  it('exports InMemorySession as a deprecated alias of KeyedSession', () => {
    expect(InMemorySession).toBe(KeyedSession);
  });

  it('ephemeral mode uses empty sessionId', () => {
    expect(session.sessionId).toBe('');
  });

  describe('keyed store mode', () => {
    it('isolates data per sessionId', async () => {
      const store = new InMemorySessionStore();
      const a = new KeyedSession(testSchemas, 'id-a', store);
      const b = new KeyedSession(testSchemas, 'id-b', store);
      expect(a.sessionId).toBe('id-a');
      expect(b.sessionId).toBe('id-b');
      await a.set('count', 1);
      await b.set('count', 2);
      expect(await a.get('count')).toBe(1);
      expect(await b.get('count')).toBe(2);
    });

    it('reloads the same logical session from a new instance', async () => {
      const store = new InMemorySessionStore();
      const first = new KeyedSession(testSchemas, 'sid', store);
      await first.set('user', { id: 'u1', name: 'Ada' });
      const second = new KeyedSession(testSchemas, 'sid', store);
      expect(await second.get('user')).toEqual({ id: 'u1', name: 'Ada' });
    });

    it('uses a custom session id factory when configured', () => {
      let n = 0;
      const store = new InMemorySessionStore({
        createSessionId: () => `custom-${++n}`,
      });
      expect(store.createSessionId()).toBe('custom-1');
      expect(store.createSessionId()).toBe('custom-2');
    });
  });

  describe('get and set', () => {
    it('should set and get a value', async () => {
      await session.set('user', { id: '1', name: 'John' });
      const user = await session.get('user');
      expect(user).toEqual({ id: '1', name: 'John' });
    });

    it('should return undefined for non-existent key', async () => {
      const value = await session.get('count');
      expect(value).toBeUndefined();
    });

    it('should handle different types', async () => {
      await session.set('count', 42);
      await session.set('isActive', true);

      const count = await session.get('count');
      const isActive = await session.get('isActive');

      expect(count).toBe(42);
      expect(isActive).toBe(true);
    });
  });

  describe('getBatch and setBatch', () => {
    it('should set and get multiple values', async () => {
      await session.setBatch({
        user: { id: '1', name: 'John' },
        count: 42,
        isActive: true,
      });

      const result = await session.getBatch('user', 'count', 'isActive');
      expect(result).toEqual({
        user: { id: '1', name: 'John' },
        count: 42,
        isActive: true,
      });
    });

    it('should handle partial updates', async () => {
      await session.setBatch({
        user: { id: '1', name: 'John' },
        count: 42,
      });

      await session.setBatch({
        count: 43,
        isActive: true,
      });

      const result = await session.getBatch('user', 'count', 'isActive');
      expect(result).toEqual({
        user: { id: '1', name: 'John' },
        count: 43,
        isActive: true,
      });
    });
  });

  describe('delete', () => {
    it('should delete a value and return it', async () => {
      await session.set('user', { id: '1', name: 'John' });
      const deletedUser = await session.delete('user');
      expect(deletedUser).toEqual({ id: '1', name: 'John' });

      const user = await session.get('user');
      expect(user).toBeUndefined();
    });

    it('should return undefined when deleting non-existent key', async () => {
      const deletedValue = await session.delete('count');
      expect(deletedValue).toBeUndefined();
    });
  });

  describe('deleteBatch', () => {
    it('should delete multiple values and return them', async () => {
      await session.setBatch({
        user: { id: '1', name: 'John' },
        count: 42,
        isActive: true,
      });

      const deletedValues = await session.deleteBatch('user', 'count');
      expect(deletedValues).toEqual({
        user: { id: '1', name: 'John' },
        count: 42,
      });

      const remainingValues = await session.getBatch(
        'user',
        'count',
        'isActive'
      );
      expect(remainingValues).toEqual({
        user: undefined,
        count: undefined,
        isActive: true,
      });
    });
  });

  describe('clear', () => {
    it('should clear all values', async () => {
      await session.setBatch({
        user: { id: '1', name: 'John' },
        count: 42,
        isActive: true,
      });

      await session.clear();

      const values = await session.getBatch('user', 'count', 'isActive');
      expect(values).toEqual({
        user: undefined,
        count: undefined,
        isActive: undefined,
      });
    });
  });

  describe('sessionSchemas', () => {
    it('should work with sessionSchemas', async () => {
      const s = new KeyedSession(defaultSessionSchemas);

      await s.set('authorizationDecisionParams', {
        ticket: 'test-ticket',
        claimNames: ['name', 'email'],
        claimLocales: ['ja', 'en'],
        idTokenClaims: 'test-claims',
        requestedClaimsForTx: ['claim1', 'claim2'],
        requestedVerifiedClaimsForTx: [{ array: ['verified1', 'verified2'] }],
      });

      const params = await s.get('authorizationDecisionParams');
      expect(params).toEqual({
        ticket: 'test-ticket',
        claimNames: ['name', 'email'],
        claimLocales: ['ja', 'en'],
        idTokenClaims: 'test-claims',
        requestedClaimsForTx: ['claim1', 'claim2'],
        requestedVerifiedClaimsForTx: [{ array: ['verified1', 'verified2'] }],
      });

      const deleted = await s.deleteBatch('authorizationDecisionParams');
      expect(deleted).toEqual({
        authorizationDecisionParams: {
          ticket: 'test-ticket',
          claimNames: ['name', 'email'],
          claimLocales: ['ja', 'en'],
          idTokenClaims: 'test-claims',
          requestedClaimsForTx: ['claim1', 'claim2'],
          requestedVerifiedClaimsForTx: [{ array: ['verified1', 'verified2'] }],
        },
      });

      const afterDelete = await s.get('authorizationDecisionParams');
      expect(afterDelete).toBeUndefined();
    });
  });
});
