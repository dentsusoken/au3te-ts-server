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
import { Session, SessionSchemas } from '@/session';
import { generateRandomCodeVerifier, generateRandomState } from 'oauth4webapi';
import { ResponseErrorFactory, ResponseFactory } from '../core';

export type ProcessRequest = (request: Request) => Promise<Response>;

export type CreateProcessRequestParams<SS extends SessionSchemas> = {
  path: string;
  extractPathParameter: ExtractPathParameter;
  federationManager: FederationManager;
  responseErrorFactory: ResponseErrorFactory;
  session: Session<SS>;
  responseFactory: ResponseFactory;
};

export const createProcessRequest = <SS extends SessionSchemas> ({
  path,
  extractPathParameter,
  federationManager,
  responseErrorFactory,
  session,
  responseFactory,
}: CreateProcessRequestParams<SS>): ProcessRequest => {
  return async (request) => {
    const { federationId } = extractPathParameter(request, path);

    let federation;
    try {
      federation = federationManager.getFederation(federationId);
    } catch (error) {
      return responseErrorFactory.notFoundResponseError(
        `Federation with ID '${federationId}' not found`
      ).response;
    }

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
