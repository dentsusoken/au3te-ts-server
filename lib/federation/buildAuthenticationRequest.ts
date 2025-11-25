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
import { calculatePKCECodeChallenge } from 'oauth4webapi';
import { FederationAuthenticationRequest } from '@vecrea/au3te-ts-common/schemas.federation';

/**
 * Builds an OAuth2/OIDC authentication request URL with PKCE support.
 * @param state - The state parameter for CSRF protection.
 * @param verifier - Optional PKCE code verifier.
 * @param method - Optional PKCE code challenge method ('plain' or 'S256'). Defaults to 'plain' if verifier is provided.
 * @returns A promise that resolves to the complete authentication request URL with query parameters.
 */
export type BuildAuthenticationRequest = (
  state: string,
  verifier?: string,
  method?: 'plain' | 'S256'
) => Promise<URL>;

/**
 * Creates a BuildAuthenticationRequest function.
 * @param authorizationEndpoint - Function that returns the authorization endpoint URL.
 * @param buildAuthenticationRequestScope - Function that returns the scope array for the authentication request.
 * @param clientId - Function that returns the client ID (can be async).
 * @param redirectUri - Function that returns the redirect URI (can be async).
 * @returns A function that builds a complete OAuth2/OIDC authentication request URL.
 * @example
 * ```ts
 * const buildRequest = createBuildAuthenticationRequest(
 *   () => Promise.resolve(new URL('https://auth.example.com/auth')),
 *   () => ['openid', 'profile'],
 *   () => 'client-id',
 *   () => new URL('https://example.com/callback')
 * );
 * const url = await buildRequest('state-123', 'verifier', 'S256');
 * ```
 */
export const createBuildAuthenticationRequest = (
  authorizationEndpoint: () => Promise<URL>,
  buildAuthenticationRequestScope: () => string[],
  clientId: () => string | Promise<string>,
  redirectUri: () => URL | Promise<URL>
): BuildAuthenticationRequest => {
  return async (
    state: string,
    verifier?: string,
    method?: 'plain' | 'S256'
  ) => {
    const endpoint = await authorizationEndpoint();
    const responseType = 'code';
    const scope = buildAuthenticationRequestScope();

    const code_challenge = verifier
      ? method === 'S256'
        ? await calculatePKCECodeChallenge(verifier)
        : verifier
      : undefined;
    const code_challenge_method = method === 'S256' ? 'S256' : 'plain';

    const parameters: FederationAuthenticationRequest = {
      response_type: responseType,
      scope: scope.join(' '),
      client_id: await clientId(),
      redirect_uri: (await redirectUri()).toString(),
      state: state,
      ...(verifier && { code_challenge }),
      ...(verifier && { code_challenge_method }),
    };

    const filteredParameters = Object.fromEntries(
      Object.entries(parameters).filter(([_, value]) => value != null)
    ) as Record<string, string>;

    endpoint.search = new URLSearchParams(filteredParameters).toString();
    return endpoint;
  };
};
