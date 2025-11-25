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
import {
  authorizationCodeGrantRequest,
  ClientSecretBasic,
  None,
  nopkce,
  TokenEndpointRequestOptions,
  processAuthorizationCodeResponse,
  TokenEndpointResponse,
  allowInsecureRequests,
} from 'oauth4webapi';
import { GetServerMetadata } from './getServerMetadata';

/**
 * Exchanges an authorization code for access and ID tokens.
 * @param callbackParameters - URL search parameters from the OAuth callback containing the authorization code.
 * @param verifier - Optional PKCE code verifier for the token exchange.
 * @param options - Optional token endpoint request options (e.g., signal for abort).
 * @returns A promise that resolves to the token response containing access_token and id_token.
 * @throws Error if the token exchange fails or the response is invalid.
 */
export type MakeTokenRequest = (
  callbackParameters: URLSearchParams,
  verifier?: string,
  options?: TokenEndpointRequestOptions
) => Promise<TokenEndpointResponse>;

/**
 * Creates a MakeTokenRequest function.
 * @param getServerMetadata - Function to retrieve the authorization server metadata.
 * @param clientId - Function that returns the client ID.
 * @param clientSecret - Function that returns the client secret (optional for public clients).
 * @param redirectUri - Function that returns the redirect URI used in the authorization request.
 * @param isDev - Whether running in development mode (allows insecure requests).
 * @returns A function that exchanges authorization codes for tokens with PKCE and client authentication support.
 * @example
 * ```ts
 * const makeToken = createMakeTokenRequest(
 *   getMetadata,
 *   () => 'client-id',
 *   () => 'client-secret',
 *   () => new URL('https://example.com/callback'),
 *   false
 * );
 * const tokenResponse = await makeToken(callbackParams, 'code-verifier');
 * ```
 */
export const createMakeTokenRequest = (
  getServerMetadata: GetServerMetadata,
  clientId: () => string,
  clientSecret: () => string | undefined,
  redirectUri: () => URL,
  isDev: boolean
): MakeTokenRequest => {
  return async (
    callbackParameters: URLSearchParams,
    verifier?: string,
    options?: TokenEndpointRequestOptions
  ) => {
    const serverMetadata = await getServerMetadata();
    const secret = clientSecret();

    const response = await authorizationCodeGrantRequest(
      serverMetadata,
      {
        client_id: clientId(),
      },
      secret ? ClientSecretBasic(secret) : None(),
      callbackParameters,
      redirectUri().toString(),
      verifier ?? nopkce,
      { ...options, [allowInsecureRequests]: isDev }
    );

    return await processAuthorizationCodeResponse(
      serverMetadata,
      {
        client_id: clientId(),
      },
      response,
      {
        requireIdToken: true,
      }
    );
  };
};
