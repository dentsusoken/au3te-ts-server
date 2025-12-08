import { describe, it, expect, beforeEach } from 'vitest';
import { z } from 'zod';
import { InMemorySession } from '../InMemorySession';
import { defaultSessionSchemas } from '../sessionSchemas';

describe('InMemorySession', () => {
  let session: InMemorySession<TestSchemas>;

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
    session = new InMemorySession(testSchemas);
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
      const session = new InMemorySession(defaultSessionSchemas);

      // AuthorizationDecisionParamsをセット
      await session.set('authorizationDecisionParams', {
        ticket: 'test-ticket',
        claimNames: ['name', 'email'],
        claimLocales: ['ja', 'en'],
        idTokenClaims: 'test-claims',
        requestedClaimsForTx: ['claim1', 'claim2'],
        requestedVerifiedClaimsForTx: [{ array: ['verified1', 'verified2'] }],
      });

      // 値を確認
      const params = await session.get('authorizationDecisionParams');
      expect(params).toEqual({
        ticket: 'test-ticket',
        claimNames: ['name', 'email'],
        claimLocales: ['ja', 'en'],
        idTokenClaims: 'test-claims',
        requestedClaimsForTx: ['claim1', 'claim2'],
        requestedVerifiedClaimsForTx: [{ array: ['verified1', 'verified2'] }],
      });

      // deleteBatchで削除
      const deleted = await session.deleteBatch('authorizationDecisionParams');
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

      // 削除後の確認
      const afterDelete = await session.get('authorizationDecisionParams');
      expect(afterDelete).toBeUndefined();
    });
  });
});
