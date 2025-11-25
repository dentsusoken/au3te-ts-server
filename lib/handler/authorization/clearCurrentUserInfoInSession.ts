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

import { Session } from '../../session/Session';
import { SessionSchemas } from '../../session/types';
import { defaultSessionSchemas } from '../../session/sessionSchemas';

/**
 * Type definition for a function that clears current user information from the session.
 * @template SS - The type of SessionSchemas
 * @param {Session<SS>} session - The session object to clear user information from
 * @returns {Promise<void>} A promise that resolves when the operation is complete
 */
export type ClearCurrentUserInfoInSession<SS extends SessionSchemas> = (
  session: Session<SS>
) => Promise<void>;

export const defaultClearCurrentUserInfoInSession: ClearCurrentUserInfoInSession<
  typeof defaultSessionSchemas
> = async (session) => {
  await session.deleteBatch('user', 'authTime');
};
