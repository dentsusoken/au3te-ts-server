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

import { User } from '@vecrea/au3te-ts-common/schemas.common';
import { Session } from '../../session/Session';
import {
  GetByCredentials,
  CacheUserAttributes,
} from '@vecrea/au3te-ts-common/handler.user';
import { SessionSchemas } from '../../session/types';

/**
 * Type definition for a function that retrieves or authenticates a user
 * @param {Session<SessionSchemas>} session - Session object to store/retrieve user data
 * @param {Record<string, string>} parameters - Request parameters containing login credentials
 * @returns {Promise<{user: User | undefined; authTime: number | undefined}>} User data and auth time if successful, undefined if not
 */
export type GetOrAuthenticateUser = (
  session: Session<SessionSchemas>,
  parameters: Record<string, string>
) => Promise<{ user: User | undefined; authTime: number | undefined }>;

/**
 * Factory type for creating a GetOrAuthenticateUser implementation.
 */
export type GetOrAuthenticateUserFactory<
  U extends User = User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = (
  getByCredentials: GetByCredentials<U, T>,
  cacheUserAttributes: CacheUserAttributes<U>
) => GetOrAuthenticateUser;

const emptyResult = { user: undefined, authTime: undefined };

/**
 * Creates a function to get or authenticate a user.
 * @param {GetByCredentials} getByCredentials - Function to validate credentials and retrieve user
 * @returns {GetOrAuthenticateUser} Function that handles user retrieval/authentication
 */
export const createGetOrAuthenticateUser =
  <
    U extends User = User,
    T extends keyof Omit<U, 'loginId' | 'password'> = never
  >(
    getByCredentials: GetByCredentials<U, T>,
    cacheUserAttributes: CacheUserAttributes<U>
  ): GetOrAuthenticateUser =>
  async (session, parameters) => {
    const { user, authTime } = await session.getBatch('user', 'authTime');

    if (user && authTime) {
      return { user, authTime };
    }

    const { loginId, password } = parameters;

    if (!loginId || !password) {
      return emptyResult;
    }

    const loginUser = await getByCredentials(loginId, password);

    if (loginUser) {
      const authTime = Math.floor(Date.now() / 1000);

      await session.setBatch({
        user: loginUser,
        authTime,
      });

      await cacheUserAttributes(loginUser, 'oidc', 300);

      return { user: loginUser, authTime };
    }

    return emptyResult;
  };
