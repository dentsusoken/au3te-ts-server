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

import { AuthorizationIssueRequest } from '@vecrea/au3te-ts-common/schemas.authorization-issue';
import { ExtractParameters } from '../../extractor/extractParameters';
import { ToApiRequest } from '../core/toApiRequest';
import { Session } from '../../session/Session';
import { SessionSchemas } from '../../session/types';
import { GetOrAuthenticateUser } from './getOrAuthenticateUser';
import { parseQueryString } from '@vecrea/au3te-ts-common/utils';
import { BuildAuthorizationFailError } from '../authorization-fail/buildAuthorizationFailError';
import { CalcSub } from '../authorization/calcSub';
import { CollectClaims } from './collectClaims';
import { ResponseErrorFactory } from '../core/responseErrorFactory';

/**
 * Parameters required to create an API request handler
 * @template SS - Session schema type extending SessionSchemas
 */
export type CreateToApiRequestParams<SS extends SessionSchemas> = {
  session: Session<SS>;
  extractParameters: ExtractParameters;
  getOrAuthenticateUser: GetOrAuthenticateUser;
  buildAuthorizationFailError: BuildAuthorizationFailError;
  calcSub: CalcSub;
  collectClaims: CollectClaims;
  responseErrorFactory: ResponseErrorFactory;
};

/**
 * Creates a function to handle authorization issue API requests
 * @param {CreateToApiRequestParams<typeof sessionSchemas>} params - Configuration parameters
 * @returns {ToApiRequest<AuthorizationIssueRequest>} Function that processes requests into AuthorizationIssueRequest
 */
export const createToApiRequest =
  <SS extends SessionSchemas>({
    session,
    extractParameters,
    getOrAuthenticateUser,
    buildAuthorizationFailError,
    calcSub,
    collectClaims,
    responseErrorFactory,
  }: CreateToApiRequestParams<SS>): ToApiRequest<AuthorizationIssueRequest> =>
  async (request: Request): Promise<AuthorizationIssueRequest> => {
    const { authorizationDecisionParams, acrs, client } =
      await session.deleteBatch(
        'authorizationDecisionParams',
        'acrs',
        'client'
      );

    if (!authorizationDecisionParams) {
      throw responseErrorFactory.badRequestResponseError(
        'Authorization decision session data not found. The session may have expired or the authorization request has not been initiated.'
      );
    }

    const ticket = authorizationDecisionParams.ticket!;
    const parametersStr = await extractParameters(request);
    const parameters = parseQueryString(parametersStr);

    if (!parameters.authorized) {
      throw await buildAuthorizationFailError(ticket, 'DENIED');
    }

    const { user, authTime } = await getOrAuthenticateUser(session, parameters);

    const subject = user?.subject;

    if (!subject) {
      throw await buildAuthorizationFailError(ticket, 'NOT_AUTHENTICATED');
    }

    const sub = await calcSub(subject, client);
    const acr = acrs?.[0];
    const claims = collectClaims(authorizationDecisionParams.claimNames, user);
    const claimsForTx = collectClaims(
      authorizationDecisionParams.requestedClaimsForTx,
      user
    );

    const apiRequest: AuthorizationIssueRequest = {
      ticket: authorizationDecisionParams.ticket!,
      subject,
      authTime,
      acr,
      sub,
      claims: claims ? JSON.stringify(claims) : undefined,
      claimsForTx: claimsForTx ? JSON.stringify(claimsForTx) : undefined,
    };

    return apiRequest;
  };
