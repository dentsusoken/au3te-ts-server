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

import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { CheckPrompts } from './checkPrompts';
import { CheckAuthAge } from './checkAuthAge';
import { ClearCurrentUserInfoInSession } from './clearCurrentUserInfoInSession';
import { Session } from '../../session/Session';
import { SessionSchemas } from '../../session/types';

/**
 * Type definition for a function that clears current user information from the session if necessary.
 * @template SS - The type of SessionSchemas
 * @param {AuthorizationResponse} response - The authorization response
 * @param {Session<SS>} session - The session object
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
export type ClearCurrentUserInfoInSessionIfNecessary<
  SS extends SessionSchemas
> = (response: AuthorizationResponse, session: Session<SS>) => Promise<void>;

/**
 * Parameters for creating a ClearCurrentUserInfoInSessionIfNecessary function
 * @template SS - The type of SessionSchemas
 */
export type CreateClearCurrentUserInfoInSessionIfNecessaryParams<
  SS extends SessionSchemas
> = {
  /** Function to check prompts */
  checkPrompts: CheckPrompts;
  /** Function to check authentication age */
  checkAuthAge: CheckAuthAge;
  /** Function to clear current user information from the session */
  clearCurrentUserInfoInSession: ClearCurrentUserInfoInSession<SS>;
};

/**
 * Creates a function to clear current user information from the session if necessary
 * @template SS - The type of SessionSchemas
 * @param {CreateClearCurrentUserInfoInSessionIfNecessaryParams<SS>} params - The parameters for creating the function
 * @returns {ClearCurrentUserInfoInSessionIfNecessary<SS>} A function that clears current user information if necessary
 */
export const createClearCurrentUserInfoInSessionIfNecessary =
  <SS extends SessionSchemas>({
    checkPrompts,
    checkAuthAge,
    clearCurrentUserInfoInSession,
  }: CreateClearCurrentUserInfoInSessionIfNecessaryParams<SS>): ClearCurrentUserInfoInSessionIfNecessary<SS> =>
  async (response, session) => {
    const authTime = (await session.get('authTime')) ?? 0;
    const shouldClear =
      checkPrompts(response.prompts) ||
      checkAuthAge(authTime, response.maxAge ?? undefined);

    if (shouldClear) {
      await clearCurrentUserInfoInSession(session);
    }
  };
