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

import { TokenCreateResponse } from '@vecrea/au3te-ts-common/schemas.token-create';
import {
  ProcessApiResponse,
  CreateProcessApiResponseParams,
} from '../core/processApiResponse';

/**
 * Builds a JSON response message for successful token creation.
 *
 * @param {TokenCreateResponse} apiResponse - The response from the Authlete API containing token details
 * @returns {string} A formatted JSON string containing the token response according to OAuth 2.0 specifications
 */
export const buildOkMessage = (apiResponse: TokenCreateResponse): string => {
  const { jwtAccessToken, accessToken, scopes, refreshToken, expiresIn } =
    apiResponse;

  return JSON.stringify(
    {
      access_token: jwtAccessToken ?? accessToken,
      issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      token_type: 'Bearer',
      expires_in: expiresIn,
      scope: scopes ? scopes.join(' ') : '',
      refresh_token: refreshToken,
    },
    undefined,
    2
  );
};

/**
 * Builds a JSON error message for token creation failures.
 *
 * @param {TokenCreateResponse} apiResponse - The response from the Authlete API containing error details
 * @returns {string} A formatted JSON string containing the error details
 */
export const buildErrorMessage = (apiResponse: TokenCreateResponse): string => {
  const { action, resultCode, resultMessage } = apiResponse;

  return JSON.stringify(
    {
      action,
      resultCode,
      resultMessage,
    },
    undefined,
    2
  );
};

/**
 * Creates a function to process API responses for Token Create requests.
 *
 * @param {CreateProcessApiResponseParams} params - Parameters for creating the process function
 * @param {string} params.path - API endpoint path
 * @param {Function} params.buildUnknownActionMessage - Function that builds message for unknown actions
 * @param {Object} params.responseFactory - Factory for creating HTTP responses
 * @param {Object} params.responseErrorFactory - Factory for creating error responses
 * @returns {ProcessApiResponse<TokenCreateResponse>} Function that processes API responses and returns HTTP responses
 */
export const createProcessApiResponse =
  ({
    path,
    buildUnknownActionMessage,
    responseFactory,
    responseErrorFactory,
  }: CreateProcessApiResponseParams): ProcessApiResponse<TokenCreateResponse> =>
  /**
   * Processes the API response for Token Create requests and generates appropriate HTTP responses.
   *
   * @param {TokenCreateResponse} apiResponse - The response from the Authlete API
   * @returns {Promise<Response>} A promise resolving to an HTTP response
   * @throws {Error} If the response processing fails
   */
  async (apiResponse: TokenCreateResponse): Promise<Response> => {
    const { action } = apiResponse;

    switch (action) {
      case 'INTERNAL_SERVER_ERROR':
        throw responseErrorFactory.internalServerErrorResponseError(
          buildErrorMessage(apiResponse)
        );
      case 'BAD_REQUEST':
        throw responseErrorFactory.badRequestResponseError(
          buildErrorMessage(apiResponse)
        );
      case 'FORBIDDEN':
        throw responseErrorFactory.forbiddenResponseError(
          buildErrorMessage(apiResponse)
        );
      case 'OK':
        return responseFactory.ok(buildOkMessage(apiResponse));
      default:
        throw responseErrorFactory.internalServerErrorResponseError(
          buildUnknownActionMessage(path, action)
        );
    }
  };
