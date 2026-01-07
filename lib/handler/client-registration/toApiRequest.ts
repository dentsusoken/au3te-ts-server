/*
 * Copyright (C) 2018-2021 Authlete, Inc.
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

import {
  ExtractAccessToken,
  ExtractParameters,
  ExtractPathParameter,
} from '@/extractor';
import { ToApiRequest } from '../core/toApiRequest';
import { ClientRegistrationRequest } from '@vecrea/au3te-ts-common/schemas.client-registration';

/**
 * Interface for creating a `ToApiRequest` function for Client Registration.
 *
 * @param {Object} params - The parameters for creating the function.
 * @param {string} params.path - The path of the endpoint.
 * @param {ExtractParameters} params.extractParameters - The function to extract parameters from the request.
 * @param {ExtractAccessToken} params.extractAccessToken - The function to extract the access token from the request.
 * @param {ExtractPathParameter} params.extractPathParameter - The function to extract path parameters from the request.
 * @returns {ToApiRequest<ClientRegistrationRequest>} The created `ToApiRequest` function.
 */
export interface CreateToApiRequest {
  (params: {
    path: string;
    extractParameters: ExtractParameters;
    extractAccessToken: ExtractAccessToken;
    extractPathParameter: ExtractPathParameter;
  }): ToApiRequest<ClientRegistrationRequest>;
}

/**
 * Creates a function that converts an HTTP request to a Client Registration API request.
 *
 * The created function extracts parameters, path parameters (like clientId), and the access token
 * from the incoming request and constructs a `ClientRegistrationRequest` object.
 *
 * @type {CreateToApiRequest}
 */
export const createToApiRequest: CreateToApiRequest = ({
  path,
  extractParameters,
  extractAccessToken,
  extractPathParameter,
}) => {
  return async (request: Request) => {
    const json = await extractParameters(request);
    const { clientId } = extractPathParameter(request, path);

    const token = extractAccessToken(request);

    return {
      json,
      token,
      clientId,
    };
  };
};
