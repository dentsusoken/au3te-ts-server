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

import { ExtractPathParameter } from '@/extractor/extractPathParameter';
import { FederationManager } from '@/federation';
import { DefaultSessionSchemas, Session } from '@/session';
import { simpleBuildResponse } from '../authorization';
import { ResponseErrorFactory } from '../core';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

export type ProcessRequest = (request: Request) => Promise<Response>;

export type CreateProcessRequestParams = {
  path: string;
  extractPathParameter: ExtractPathParameter;
  federationManager: FederationManager;
  responseErrorFactory: ResponseErrorFactory;
  session: Session<DefaultSessionSchemas>;
};

export const createProcessRequest = ({
  path,
  extractPathParameter,
  federationManager,
  responseErrorFactory,
  session,
}: CreateProcessRequestParams): ProcessRequest => {
  return async (request: Request) => {
    try {
      const { federationId } = extractPathParameter(request, path);

      let federation: ReturnType<typeof federationManager.getFederation>;
      try {
        federation = federationManager.getFederation(federationId);
      } catch (error) {
        return responseErrorFactory.notFoundResponseError(
          `Federation with ID '${federationId}' not found`
        ).response;
      }

      const federationCallbackParams = await session.get(
        'federationCallbackParams'
      );
      if (!federationCallbackParams) {
        return responseErrorFactory.badRequestResponseError(
          'Federation parameters not found'
        ).response;
      }

      const model = await session.get('authorizationPageModel');
      if (!model) {
        return responseErrorFactory.badRequestResponseError(
          'Authorization page model not found'
        ).response;
      }

      // Only OIDC protocol is supported
      if (federationCallbackParams.protocol !== 'oidc') {
        return responseErrorFactory.badRequestResponseError(
          `Unsupported protocol: ${federationCallbackParams.protocol}. Only 'oidc' protocol is supported.`
        ).response;
      }

      const { state, codeVerifier } = federationCallbackParams;

      if (!state) {
        return responseErrorFactory.badRequestResponseError('State not found')
          .response;
      }

      let userinfo;
      try {
        userinfo = await federation.processFederationResponse(
          new URL(request.url),
          state,
          codeVerifier ?? undefined
        );
      } catch (error) {
        return responseErrorFactory.badRequestResponseError(
          `Failed to process federation response: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ).response;
      }

      const user: User = {
        ...userinfo,
        subject: `${userinfo.sub}@${federationId}`,
      };

      const authTime = Math.floor(Date.now() / 1000);

      await session.setBatch({
        user,
        authTime,
      });

      model.user = user;

      return simpleBuildResponse(model);
    } catch (error) {
      return responseErrorFactory.internalServerErrorResponseError(
        `Unexpected error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ).response;
    }
  };
};
