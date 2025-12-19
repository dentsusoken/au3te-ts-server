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

import { Saml2Federation } from '@/federation/saml2/Saml2Federation';
import { DefaultSessionSchemas, Session } from '@/session';
import { AuthorizationPageModel } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';
import { simpleBuildResponse } from '../authorization';
import { ResponseErrorFactory } from '../core';

export type ProcessSaml2Request = (
  request: Request,
  federation: Saml2Federation
) => Promise<Response>;

export type CreateProcessSaml2RequestParams<
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  responseErrorFactory: ResponseErrorFactory;
  session: Session<SS>;
  userHandler: UserHandlerConfiguration<U, T>;
};

export const createProcessSaml2Request = <
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
>({
  responseErrorFactory,
  session,
  userHandler,
}: CreateProcessSaml2RequestParams<SS, U, T>): ProcessSaml2Request => {
  return async (
    request: Request,
    federation: Saml2Federation
  ): Promise<Response> => {
    try {
      // ===============

      const model = await session.get('authorizationPageModel');
      if (!model) {
        return responseErrorFactory.badRequestResponseError(
          'Authorization page model not found'
        ).response;
      }

      let userinfo;
      try {
        userinfo = await federation.processSaml2Response(request);
      } catch (error) {
        return responseErrorFactory.badRequestResponseError(
          `Failed to process federation response: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        ).response;
      }

      const { nameID } = userinfo;
      const user = {
        subject: `${nameID}@${federation.id}`,
      } as U;

      const authTime = Math.floor(Date.now() / 1000);

      await session.setBatch({
        user,
        authTime,
      });

      model.user = user;
      await userHandler.addUser(user); // 5 minutes
      await userHandler.cacheUserAttributes(
        { ...user, ...userinfo.attributes } as U,
        'saml2',
        300
      ); // 5 minutes

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
