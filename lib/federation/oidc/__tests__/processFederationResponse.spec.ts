import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessFederationResponse } from '../processFederationResponse';
import { ExtractAuthorizationCode } from '../extractAuthorizationCode';
import { MakeTokenRequest } from '../makeTokenRequest';
import { ValidateIdToken } from '../validateIdToken';
import { MakeUserInfoRequest } from '../makeUserInfoRequest';

describe('createProcessFederationResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process federation response and return user info', async () => {
    const mockSearchParams = new URLSearchParams({ code: 'auth-code' });
    const mockTokenResponse = {
      access_token: 'access-token-123',
      id_token: 'id-token-123',
    };
    const mockIdTokenClaims = {
      sub: 'user-123',
      iss: 'https://example.com',
    };
    const mockUserInfo = {
      sub: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    const extractAuthorizationCode: ExtractAuthorizationCode = vi
      .fn()
      .mockResolvedValue(mockSearchParams);
    const makeTokenRequest: MakeTokenRequest = vi.fn().mockResolvedValue(mockTokenResponse as any);
    const validateIdToken: ValidateIdToken = vi.fn().mockReturnValue(mockIdTokenClaims);
    const makeUserInfoRequest: MakeUserInfoRequest = vi
      .fn()
      .mockResolvedValue(mockUserInfo as any);

    const processFederationResponse = createProcessFederationResponse(
      extractAuthorizationCode,
      makeTokenRequest,
      validateIdToken,
      makeUserInfoRequest
    );

    const responseUrl = new URL('https://example.com/callback?code=auth-code&state=test-state');
    const result = await processFederationResponse(responseUrl, 'test-state', 'code-verifier');

    expect(extractAuthorizationCode).toHaveBeenCalledWith(responseUrl, 'test-state');
    expect(makeTokenRequest).toHaveBeenCalledWith(mockSearchParams, 'code-verifier');
    expect(validateIdToken).toHaveBeenCalledWith(mockTokenResponse);
    expect(makeUserInfoRequest).toHaveBeenCalledWith('access-token-123', 'user-123');
    expect(result).toEqual(mockUserInfo);
  });

  it('should work without codeVerifier', async () => {
    const mockSearchParams = new URLSearchParams({ code: 'auth-code' });
    const mockTokenResponse = {
      access_token: 'access-token-123',
      id_token: 'id-token-123',
    };
    const mockIdTokenClaims = {
      sub: 'user-123',
    };
    const mockUserInfo = {
      sub: 'user-123',
      name: 'Test User',
    };

    const extractAuthorizationCode: ExtractAuthorizationCode = vi
      .fn()
      .mockResolvedValue(mockSearchParams);
    const makeTokenRequest: MakeTokenRequest = vi.fn().mockResolvedValue(mockTokenResponse as any);
    const validateIdToken: ValidateIdToken = vi.fn().mockReturnValue(mockIdTokenClaims);
    const makeUserInfoRequest: MakeUserInfoRequest = vi
      .fn()
      .mockResolvedValue(mockUserInfo as any);

    const processFederationResponse = createProcessFederationResponse(
      extractAuthorizationCode,
      makeTokenRequest,
      validateIdToken,
      makeUserInfoRequest
    );

    const responseUrl = new URL('https://example.com/callback?code=auth-code&state=test-state');
    const result = await processFederationResponse(responseUrl, 'test-state');

    expect(makeTokenRequest).toHaveBeenCalledWith(mockSearchParams, undefined);
    expect(result).toEqual(mockUserInfo);
  });

  it('should handle undefined idTokenClaims.sub', async () => {
    const mockSearchParams = new URLSearchParams({ code: 'auth-code' });
    const mockTokenResponse = {
      access_token: 'access-token-123',
      id_token: 'id-token-123',
    };
    const mockUserInfo = {
      sub: 'user-123',
      name: 'Test User',
    };

    const extractAuthorizationCode: ExtractAuthorizationCode = vi
      .fn()
      .mockResolvedValue(mockSearchParams);
    const makeTokenRequest: MakeTokenRequest = vi.fn().mockResolvedValue(mockTokenResponse as any);
    const validateIdToken: ValidateIdToken = vi.fn().mockReturnValue(undefined);
    const makeUserInfoRequest: MakeUserInfoRequest = vi
      .fn()
      .mockResolvedValue(mockUserInfo as any);

    const processFederationResponse = createProcessFederationResponse(
      extractAuthorizationCode,
      makeTokenRequest,
      validateIdToken,
      makeUserInfoRequest
    );

    const responseUrl = new URL('https://example.com/callback?code=auth-code&state=test-state');
    const result = await processFederationResponse(responseUrl, 'test-state');

    expect(makeUserInfoRequest).toHaveBeenCalledWith('access-token-123', undefined);
    expect(result).toEqual(mockUserInfo);
  });
});

