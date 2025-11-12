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

import { AuthorizationResponse } from '@vecrea/au3te-ts-common/schemas.authorization';
import { ProcessApiResponse } from '../core/processApiResponse';
import { GenerateAuthorizationPage } from './generateAuthorizationPage';
import { HandleNoInteraction } from './handleNoInteraction';
import { CreateProcessApiResponseParams } from '../core/processApiResponse';
import { Session } from '../../session/Session';
import { SessionSchemas } from '../../session/types';
import { ApiResponseWithOptions } from '../core';

/**
 * Extended parameters for creating a process API response function for authorization.
 * @template SS - The type of SessionSchemas
 */
export type CreateProcessApiResponseParams4Authorization<
  SS extends SessionSchemas,
  OPTS = unknown
> = {
  /** The session object */
  session: Session<SS>;
  /** Function to generate the authorization page */
  generateAuthorizationPage: GenerateAuthorizationPage<SS, OPTS>;
  /** Function to handle no interaction cases */
  handleNoInteraction: HandleNoInteraction<SS>;
} & CreateProcessApiResponseParams;

/**
 * Creates a function to process API responses for Authorization requests.
 * @template SS - The type of SessionSchemas
 * @template OPTS - The type of handler options
 * @param {CreateProcessApiResponseParams4Authorization<SS, OPTS>} params - The parameters for creating the process function
 * @returns {ProcessApiResponse<AuthorizationResponse, OPTS>} A function that processes Authorization API responses
 */
export const createProcessApiResponse =
  <SS extends SessionSchemas, OPTS = unknown>({
    path,
    session,
    generateAuthorizationPage,
    handleNoInteraction,
    buildUnknownActionMessage,
    responseFactory,
    responseErrorFactory,
  }: CreateProcessApiResponseParams4Authorization<SS, OPTS>): ProcessApiResponse<
    ApiResponseWithOptions<AuthorizationResponse, OPTS>,
    OPTS
  > =>
  /**
   * Processes the API response for Authorization requests.
   * @param {AuthorizationResponse} apiResponse - The response from the Authlete API for Authorization
   * @returns {Promise<Response>} A promise that resolves to the HTTP response
   */
  async (
    apiResponse: ApiResponseWithOptions<AuthorizationResponse, OPTS>,
    _options?: OPTS
  ): Promise<Response> => {
    const { action, responseContent } = apiResponse.apiResponse;

    switch (action) {
      case 'INTERNAL_SERVER_ERROR':
        throw responseErrorFactory.internalServerErrorResponseError(
          responseContent
        );
      case 'BAD_REQUEST':
        throw responseErrorFactory.badRequestResponseError(responseContent);
      case 'LOCATION':
        return responseFactory.location(responseContent!);
      case 'FORM':
        return responseFactory.form(responseContent);
      case 'INTERACTION':
        return await generateAuthorizationPage(apiResponse.apiResponse, session);
      case 'NO_INTERACTION':
        return await handleNoInteraction(apiResponse.apiResponse, session);
      default:
        throw responseErrorFactory.internalServerErrorResponseError(
          buildUnknownActionMessage(path, action)
        );
    }
  };
