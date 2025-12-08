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
import { ResponseErrorFactory } from '../core';
import { ProcessOidcRequest } from './processOidcRequest';
import { ProcessSaml2Request } from './processSaml2Request';

export type ProcessRequest = (request: Request) => Promise<Response>;

export type CreateProcessRequestParams = {
  path: string;
  extractPathParameter: ExtractPathParameter;
  federationManager: FederationManager;
  responseErrorFactory: ResponseErrorFactory;
  processOidcRequest: ProcessOidcRequest;
  processSaml2Request: ProcessSaml2Request;
};

export const createProcessRequest = ({
  path,
  extractPathParameter,
  federationManager,
  responseErrorFactory,
  processOidcRequest,
  processSaml2Request,
}: CreateProcessRequestParams): ProcessRequest => {
  return async (request: Request): Promise<Response> => {
    const { federationId } = extractPathParameter(request, path);

    let federation: ReturnType<typeof federationManager.getFederation>;
    try {
      federation = federationManager.getFederation(federationId);
    } catch (error) {
      return responseErrorFactory.notFoundResponseError(
        `Federation with ID '${federationId}' not found`
      ).response;
    }

    if (federation.type === 'oidc') {
      return processOidcRequest(request, federation);
    }
    return processSaml2Request(request, federation);
  };
};
