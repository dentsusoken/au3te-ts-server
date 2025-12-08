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

import { OidcFederation } from '@/federation/oidc/OidcFederation';
import { DefaultSessionSchemas, Session } from '@/session';
import { AuthorizationPageModel } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';
import { simpleBuildResponse } from '../authorization';
import { ResponseErrorFactory } from '../core';

export type ProcessOidcRequest = (
  request: Request,
  federation: OidcFederation
) => Promise<Response>;

export type CreateProcessOidcRequestParams<
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  responseErrorFactory: ResponseErrorFactory;
  session: Session<SS>;
  userHandler: UserHandlerConfiguration<U, T>;
};

export const createProcessOidcRequest = <
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
>({
  responseErrorFactory,
  session,
  userHandler,
}: CreateProcessOidcRequestParams<SS, U, T>): ProcessOidcRequest => {
  return async (
    request: Request,
    federation: OidcFederation
  ): Promise<Response> => {
    try {
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

      const { sub, ...userInfoWithoutSub } = userinfo;
      const user: U = {
        ...userInfoWithoutSub,
        subject: `${sub}@${federation.id}`,
      } as U;

      const authTime = Math.floor(Date.now() / 1000);

      await session.setBatch({
        user,
        authTime,
      });

      model.user = user;
      await userHandler.addUser(user);

      return simpleBuildResponse(model as AuthorizationPageModel);
    } catch (error) {
      return responseErrorFactory.internalServerErrorResponseError(
        `Unexpected error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ).response;
    }
  };
};
