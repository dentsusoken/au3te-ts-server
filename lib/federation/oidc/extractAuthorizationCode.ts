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
import { validateAuthResponse } from 'oauth4webapi';
import { GetServerMetadata } from './getServerMetadata';

/**
 * Extracts and validates the authorization code from the OAuth callback response.
 * @param response - The callback URL containing the authorization response.
 * @param state - Optional state parameter to validate against the response.
 * @returns A promise that resolves to URLSearchParams containing the validated authorization code and other parameters.
 * @throws Error if the authorization response is invalid or state mismatch occurs.
 */
export type ExtractAuthorizationCode = (
  response: URL,
  state?: string
) => Promise<URLSearchParams>;

/**
 * Creates an ExtractAuthorizationCode function.
 * @param getServerMetadata - Function to retrieve the authorization server metadata.
 * @param clientId - Function that returns the client ID.
 * @returns A function that extracts and validates the authorization code from the callback URL.
 * @example
 * ```ts
 * const extractCode = createExtractAuthorizationCode(getMetadata, () => 'client-id');
 * const params = await extractCode(new URL('https://example.com/callback?code=abc123&state=xyz'));
 * ```
 */
export const createExtractAuthorizationCode = (
  getServerMetadata: GetServerMetadata,
  clientId: () => string
): ExtractAuthorizationCode => {
  return async (response: URL, state?: string) => {
    const serverMetadata = await getServerMetadata();
    return validateAuthResponse(
      serverMetadata,
      {
        client_id: clientId(),
      },
      response.searchParams,
      state
    );
  };
};
