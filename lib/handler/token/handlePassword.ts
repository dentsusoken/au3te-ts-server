/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the
 * License.
 */

import { TokenResponse } from '@vecrea/au3te-ts-common/schemas.token';
import { GetByCredentials } from '@vecrea/au3te-ts-common/handler.user';
import { Headers } from '../core/responseFactory';
import { Handle } from '../core/handle';
import { TokenIssueRequest } from '@vecrea/au3te-ts-common/schemas.token-issue';
import { BuildTokenFailError } from '../token-fail/buildTokenFailError';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

/**
 * Handler function type for processing password grant type token requests
 */
export type HandlePassword = (
  response: TokenResponse,
  headers: Headers
) => Promise<Response>;

/**
 * Parameters required to create a password grant type handler
 */
type CreateHandlePasswordParams<
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  getByCredentials: GetByCredentials<U, T>;
  handle4TokenIssue: Handle<TokenIssueRequest, Headers>;
  buildTokenFailError: BuildTokenFailError;
};

/**
 * Creates a handler for processing password grant type token requests
 *
 * @param getByCredentials - Function to validate user credentials and retrieve user information
 * @param handle4TokenIssue - Handler for token issuance requests
 * @param buildTokenFailError - Function to build error responses for token failures
 * @returns A handler function that processes password grant type requests
 * @throws Error if username, password or ticket is missing
 * @throws ResponseError if user credentials are invalid
 */
export const createHandlePassword =
  <U extends User, T extends keyof Omit<U, 'loginId' | 'password'> = never>({
    getByCredentials,
    handle4TokenIssue,
    buildTokenFailError,
  }: CreateHandlePasswordParams<U, T>): HandlePassword =>
  async (response: TokenResponse, headers: Headers): Promise<Response> => {
    const { username, password, ticket } = response;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    if (!ticket) {
      throw new Error('Ticket is required');
    }

    const user = await getByCredentials(username, password);
    const subject = user?.subject;

    if (subject) {
      const tokenIssueRequest: TokenIssueRequest = {
        ticket,
        subject,
      };

      return await handle4TokenIssue(tokenIssueRequest, headers);
    } else {
      throw buildTokenFailError(
        ticket,
        'INVALID_RESOURCE_OWNER_CREDENTIALS',
        headers
      );
    }
  };
