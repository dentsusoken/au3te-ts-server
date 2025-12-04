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
  UserInfoResponse,
  userInfoRequest,
  UserInfoRequestOptions,
  processUserInfoResponse,
  skipSubjectCheck,
  allowInsecureRequests,
} from 'oauth4webapi';
import { GetServerMetadata } from './getServerMetadata';

/**
 * Fetches user information from the UserInfo endpoint.
 * @param accessToken - The access token obtained from the token exchange.
 * @param expectedSubject - Optional expected subject (sub) claim to validate against the user info response.
 * @param options - Optional user info request options (e.g., signal for abort).
 * @returns A promise that resolves to the user information response.
 * @throws Error if the user info request fails or subject validation fails.
 */
export type MakeUserInfoRequest = (
  accessToken: string,
  expectedSubject?: string,
  options?: UserInfoRequestOptions
) => Promise<UserInfoResponse>;

/**
 * Creates a MakeUserInfoRequest function.
 * @param getServerMetadata - Function to retrieve the authorization server metadata.
 * @param clientId - Function that returns the client ID.
 * @param isDev - Whether running in development mode (allows insecure requests).
 * @returns A function that fetches user information with optional subject validation.
 * @example
 * ```ts
 * const makeUserInfo = createMakeUserInfoRequest(getMetadata, () => 'client-id', false);
 * const userInfo = await makeUserInfo('access-token', 'user-123');
 * ```
 */
export const createMakeUserInfoRequest = (
  getServerMetadata: GetServerMetadata,
  clientId: () => string,
  isDev: boolean
): MakeUserInfoRequest => {
  return async (accessToken, expectedSubject, options) => {
    const serverMetadata = await getServerMetadata();

    const res = await userInfoRequest(
      serverMetadata,
      {
        client_id: clientId(),
      },
      accessToken,
      { ...options, [allowInsecureRequests]: isDev }
    );

    return processUserInfoResponse(
      serverMetadata,
      {
        client_id: clientId(),
      },
      expectedSubject ?? skipSubjectCheck,
      res
    );
  };
};
