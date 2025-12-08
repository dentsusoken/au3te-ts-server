/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { UserInfoResponse } from 'oauth4webapi';
import { ExtractAuthorizationCode } from './extractAuthorizationCode';
import { MakeTokenRequest } from './makeTokenRequest';
import { ValidateIdToken } from './validateIdToken';
import { MakeUserInfoRequest } from './makeUserInfoRequest';

/**
 * Processes the federation authentication response and retrieves user information.
 * This function performs the complete OAuth2/OIDC flow: extracts authorization code,
 * exchanges it for tokens, validates the ID token, and fetches user info.
 * @param authenticationResponse - The callback URL containing the authorization response.
 * @param state - The state parameter used for CSRF protection.
 * @param codeVerifier - Optional PKCE code verifier for token exchange.
 * @returns A promise that resolves to the user information response.
 * @throws Error if any step in the federation response processing fails.
 */
export type ProcessFederationResponse = (
  authenticationResponse: URL,
  state: string,
  codeVerifier?: string
) => Promise<UserInfoResponse>;

/**
 * Creates a ProcessFederationResponse function.
 * @param extractAuthorizationCode - Function to extract the authorization code from the callback URL.
 * @param makeTokenRequest - Function to exchange the authorization code for tokens.
 * @param validateIdToken - Function to validate and extract claims from the ID token.
 * @param makeUserInfoRequest - Function to fetch user information using the access token.
 * @returns A function that processes the complete federation authentication flow.
 * @example
 * ```ts
 * const processResponse = createProcessFederationResponse(
 *   extractCode, makeToken, validateToken, makeUserInfo
 * );
 * const userInfo = await processResponse(callbackUrl, 'state-123', 'verifier');
 * ```
 */
export const createProcessFederationResponse = (
  extractAuthorizationCode: ExtractAuthorizationCode,
  makeTokenRequest: MakeTokenRequest,
  validateIdToken: ValidateIdToken,
  makeUserInfoRequest: MakeUserInfoRequest
): ProcessFederationResponse => {
  return async (authenticationResponse, state, codeVerifier) => {
    const searchParams = await extractAuthorizationCode(
      authenticationResponse,
      state
    );

    const tokenResponse = await makeTokenRequest(searchParams, codeVerifier);
    const idTokenClaims = validateIdToken(tokenResponse);

    const accessToken = tokenResponse.access_token;

    const userInfo = await makeUserInfoRequest(accessToken, idTokenClaims?.sub);

    return userInfo;
  };
};
