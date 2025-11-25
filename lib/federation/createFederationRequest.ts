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
import { BuildAuthenticationRequest } from './buildAuthenticationRequest';

/**
 * Creates a federation authentication request URL.
 * @param state - The state parameter for CSRF protection.
 * @param codeVerifier - Optional PKCE code verifier. If provided, S256 method will be used.
 * @returns A promise that resolves to the authentication request URL.
 */
export type CreateFederationRequest = (
  state: string,
  codeVerifier?: string
) => Promise<URL>;

/**
 * Creates a CreateFederationRequest function.
 * @param buildAuthenticationRequest - Function to build the authentication request URL.
 * @returns A function that creates a federation authentication request URL with PKCE support.
 * @example
 * ```ts
 * const createFederationRequest = createCreateFederationRequest(buildAuthRequest);
 * const url = await createFederationRequest('state-123', 'code-verifier');
 * ```
 */
export const createCreateFederationRequest = (
  buildAuthenticationRequest: BuildAuthenticationRequest
): CreateFederationRequest => {
  return async (state, codeVerifier) => {
    return await buildAuthenticationRequest(
      state,
      codeVerifier,
      codeVerifier ? 'S256' : undefined
    );
  };
};
