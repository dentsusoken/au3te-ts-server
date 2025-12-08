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
import { DefaultSessionSchemas, Session } from '@/session';
import { generateRandomCodeVerifier, generateRandomState } from 'oauth4webapi';
import { ResponseFactory } from '../core';
import { OidcFederation } from '@/federation/oidc/OidcFederation';

export type ProcessOidcRequest = (
  federation: OidcFederation
) => Promise<Response>;

export type CreateProcessOidcRequestParams = {
  session: Session<DefaultSessionSchemas>;
  responseFactory: ResponseFactory;
};

export const createProcessOidcRequest = ({
  session,
  responseFactory,
}: CreateProcessOidcRequestParams): ProcessOidcRequest => {
  return async (federation: OidcFederation) => {
    const state = generateRandomState();
    const codeVerifier = generateRandomCodeVerifier();

    await session.set('federationCallbackParams', {
      state: state,
      codeVerifier: codeVerifier,
    });

    const authenticationRequest = await federation.createFederationRequest(
      state,
      codeVerifier
    );

    return responseFactory.location(authenticationRequest.toString());
  };
};
