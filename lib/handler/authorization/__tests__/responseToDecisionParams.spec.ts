import { describe, it, expect } from 'vitest';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { AuthorizationDecisionParams } from '@vecrea/au3te-ts-common/schemas.authorization-decision';
import { defaultResponseToDecisionParams } from '../responseToDecisionParams';

describe('defaultResponseToDecisionParams', () => {
  it('should correctly transform AuthorizationResponse to AuthorizationDecisionParams and add txn claim', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
      claims: ['claim1', 'claim2'],
      claimsLocales: ['en', 'ja'],
      idTokenClaims: 'id-token-claims',
      requestedClaimsForTx: ['tx-claim1', 'tx-claim2'],
      requestedVerifiedClaimsForTx: [
        { array: ['verified-claim1', 'verified-claim2'] },
      ],
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    const expectedResult: AuthorizationDecisionParams = {
      ticket: 'test-ticket',
      claimNames: ['claim1', 'claim2', 'txn'],
      claimLocales: ['en', 'ja'],
      idTokenClaims: 'id-token-claims',
      requestedClaimsForTx: ['tx-claim1', 'tx-claim2'],
      requestedVerifiedClaimsForTx: [
        { array: ['verified-claim1', 'verified-claim2'] },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle undefined claims without adding txn', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    expect(result).toEqual({
      ticket: 'test-ticket',
      claimNames: undefined,
      claimLocales: undefined,
      idTokenClaims: undefined,
      requestedClaimsForTx: undefined,
      requestedVerifiedClaimsForTx: undefined,
    });
  });

  it('should handle null claims without adding txn', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
      claims: null,
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    expect(result).toEqual({
      ticket: 'test-ticket',
      claimNames: undefined,
      claimLocales: undefined,
      idTokenClaims: undefined,
      requestedClaimsForTx: undefined,
      requestedVerifiedClaimsForTx: undefined,
    });
  });

  it('should add txn claim to empty claims array', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
      claims: [],
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    expect(result.claimNames).toEqual(['txn']);
  });

  it('should derive claimNames from scopes when claims and idTokenClaims are absent', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
      scopes: [{ name: 'openid' }, { name: 'email' }],
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    expect(result.claimNames).toEqual([
      'email',
      'email_verified',
      'sub',
      'txn',
    ]);
  });

  it('should prefer idTokenClaims JSON over scope-derived names when claims is absent', () => {
    const mockResponse: AuthorizationResponse = {
      action: 'INTERACTION',
      ticket: 'test-ticket',
      idTokenClaims: JSON.stringify({ id_token: { given_name: null, email: null } }),
      scopes: [{ name: 'openid' }, { name: 'profile' }],
    };

    const result = defaultResponseToDecisionParams(mockResponse);

    expect(result.claimNames).toEqual(['given_name', 'email', 'txn']);
  });

  describe('claimLocales normalization', () => {
    it('should normalize claim locales by removing duplicates case-insensitively', () => {
      const mockResponse: AuthorizationResponse = {
        action: 'INTERACTION',
        ticket: 'test-ticket',
        claimsLocales: ['en-US', 'EN-us', 'ja-JP', 'JA-jp', 'fr-FR'],
      };

      const result = defaultResponseToDecisionParams(mockResponse);

      expect(result.claimLocales).toEqual(['en-US', 'ja-JP', 'fr-FR']);
    });

    it('should handle empty claim locales array', () => {
      const mockResponse: AuthorizationResponse = {
        action: 'INTERACTION',
        ticket: 'test-ticket',
        claimsLocales: [],
      };

      const result = defaultResponseToDecisionParams(mockResponse);

      expect(result.claimLocales).toBeUndefined();
    });

    it('should handle null claim locales', () => {
      const mockResponse: AuthorizationResponse = {
        action: 'INTERACTION',
        ticket: 'test-ticket',
        claimsLocales: null,
      };

      const result = defaultResponseToDecisionParams(mockResponse);

      expect(result.claimLocales).toBeUndefined();
    });

    it('should filter out empty claim locale strings', () => {
      const mockResponse: AuthorizationResponse = {
        action: 'INTERACTION',
        ticket: 'test-ticket',
        claimsLocales: ['en-US', '', 'ja-JP', '   ', 'fr-FR'],
      };

      const result = defaultResponseToDecisionParams(mockResponse);

      expect(result.claimLocales).toEqual(['en-US', 'ja-JP', 'fr-FR']);
    });

    it('should return undefined when all claim locales are filtered out', () => {
      const mockResponse: AuthorizationResponse = {
        action: 'INTERACTION',
        ticket: 'test-ticket',
        claimsLocales: ['', '   '],
      };

      const result = defaultResponseToDecisionParams(mockResponse);

      expect(result.claimLocales).toBeUndefined();
    });
  });
});
