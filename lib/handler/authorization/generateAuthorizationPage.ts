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

import { BuildAuthorizationPageModel } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { Session } from '../../session/Session';
import { SessionSchemas } from '../../session/types';
import { ClearCurrentUserInfoInSessionIfNecessary } from './clearCurrentUserInfoInSessionIfNecessary';
import { BuildResponse } from './buildResponse';
import { ResponseToDecisionParams } from './responseToDecisionParams';

/**
 * Type definition for a function that generates an authorization page.
 * @template SS - The type of SessionSchemas
 * @param {AuthorizationResponse} response - The authorization response
 * @param {Session<SS>} session - The session object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export type GenerateAuthorizationPage<SS extends SessionSchemas, OPTS = unknown> = (
  response: AuthorizationResponse,
  session: Session<SS>,
  options?: OPTS
) => Promise<Response>;

/**
 * Parameters for creating a GenerateAuthorizationPage function
 * @template SS - The type of SessionSchemas
 */
export type CreateGenerateAuthorizationPageParams<
  SS extends SessionSchemas
> = {
  /** Function to convert response to decision parameters */
  responseToDecisionParams: ResponseToDecisionParams;
  /** Function to clear current user information from the session if necessary */
  clearCurrentUserInfoInSessionIfNecessary: ClearCurrentUserInfoInSessionIfNecessary<SS>;
  /** Function to build the authorization page model */
  buildAuthorizationPageModel: BuildAuthorizationPageModel;
  /** Function to build the response */
  buildResponse: BuildResponse;
};

/**
 * Creates a function to generate an authorization page
 * @template SS - The type of SessionSchemas
 * @param {CreateGenerateAuthorizationPageParams<SS>} params - The parameters for creating the function
 * @returns {GenerateAuthorizationPage<SS>} A function that generates an authorization page
 */
export const createGenerateAuthorizationPage =
  <SS extends SessionSchemas, OPTS = unknown>({
    responseToDecisionParams,
    clearCurrentUserInfoInSessionIfNecessary,
    buildAuthorizationPageModel,
    buildResponse,
  }: CreateGenerateAuthorizationPageParams<SS>): GenerateAuthorizationPage<SS, OPTS> =>
  async (response, session) => {
    const authorizationDecisionParams = responseToDecisionParams(response);
    const { acrs, client } = response;

    await session.setBatch({
      authorizationDecisionParams,
      acrs,
      client,
    });
    await clearCurrentUserInfoInSessionIfNecessary(response, session);
    const user = await session.get('user');
    const model = buildAuthorizationPageModel(response, user);

    return buildResponse(model);
  };
