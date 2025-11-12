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
import { AuthorizationIssueRequest } from '@vecrea/au3te-ts-common/schemas.authorization-issue';
import { Session } from '../../session/Session';
import { CheckAuthAge } from './checkAuthAge';
import { BuildAuthorizationFailError } from '../authorization-fail/buildAuthorizationFailError';
import { CheckSubject } from './checkSubject';
import { CalcSub } from './calcSub';
import { Handle } from '../core/handle';
import { SessionSchemas } from '../../session/types';

/**
 * Type definition for a function that handles no interaction authorization.
 * @template SS - The type of SessionSchemas
 * @param {AuthorizationResponse} response - The authorization response
 * @param {Session<SS>} session - The session object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export type HandleNoInteraction<SS extends SessionSchemas> = (
  response: AuthorizationResponse,
  session: Session<SS>
) => Promise<Response>;

/**
 * Parameters for creating a HandleNoInteraction function
 */
export type CreateHandleNoInteractionParams = {
  checkAuthAge: CheckAuthAge;
  checkSubject: CheckSubject;
  calcSub: CalcSub;
  buildAuthorizationFailError: BuildAuthorizationFailError;
  handle4AuthorizationIssue: Handle<AuthorizationIssueRequest>;
};

/**
 * Creates a function to handle no interaction authorization
 * @template SS - The type of SessionSchemas
 * @param {CreateHandleNoInteractionParams} params - The parameters for creating the function
 * @returns {HandleNoInteraction<SS>} A function that handles no interaction authorization
 */
export const createHandleNoInteraction = <SS extends SessionSchemas>({
  checkAuthAge,
  checkSubject,
  calcSub,
  buildAuthorizationFailError,
  handle4AuthorizationIssue,
}: CreateHandleNoInteractionParams): HandleNoInteraction<SS> => {
  return async (response, session) => {
    const { user, authTime: rawAuthTime } = await session.getBatch(
      'user',
      'authTime'
    );
    const authTime = rawAuthTime ?? 0;

    if (!user) {
      throw await buildAuthorizationFailError(
        response.ticket!,
        'NOT_LOGGED_IN'
      );
    }

    if (checkAuthAge(authTime, response.maxAge ?? undefined)) {
      throw await buildAuthorizationFailError(
        response.ticket!,
        'EXCEEDS_MAX_AGE'
      );
    }

    if (checkSubject(response.subject ?? undefined, user.subject)) {
      throw await buildAuthorizationFailError(
        response.ticket!,
        'DIFFERENT_SUBJECT'
      );
    }

    const sub = await calcSub(response.subject ?? undefined, response.client);
    const authorizationIssueRequest: AuthorizationIssueRequest = {
      ticket: response.ticket!,
      subject: response.subject,
      authTime,
      sub,
    };

    return handle4AuthorizationIssue(authorizationIssueRequest);
  };
};
