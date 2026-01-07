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

import { ClientRegistrationResponse } from '@vecrea/au3te-ts-common/schemas.client-registration';
import { CreateProcessApiResponseParams, ProcessApiResponse } from '../core';

/**
 * Interface for creating a `ProcessApiResponse` function for Client Registration.
 *
 * @param {CreateProcessApiResponseParams} params - The parameters for creating the function.
 * @returns {ProcessApiResponse<ClientRegistrationResponse>} The created `ProcessApiResponse` function.
 */
export interface CreateProcessApiResponse {
  (
    params: CreateProcessApiResponseParams
  ): ProcessApiResponse<ClientRegistrationResponse>;
}

/**
 * Creates a function that processes the API response from the Client Registration API.
 *
 * The created function handles various actions returned by the Authlete API (OK, CREATED, UPDATED, DELETED, etc.)
 * and generates the appropriate HTTP response using the provided `responseFactory` and `responseErrorFactory`.
 *
 * @type {CreateProcessApiResponse}
 */
export const createProcessApiResponse: CreateProcessApiResponse = ({
  responseFactory,
  responseErrorFactory,
}) => {
  return async (apiResponse: ClientRegistrationResponse) => {
    const { action, responseContent } = apiResponse;

    switch (action) {
      case 'OK':
        return responseFactory.ok(responseContent);
      case 'CREATED':
        return responseFactory.created(responseContent);
      case 'UPDATED':
        return responseFactory.ok(responseContent);
      case 'DELETED':
        return responseFactory.noContent();
      case 'UNAUTHORIZED':
        throw responseErrorFactory.unauthorizedResponseError(responseContent);
      case 'BAD_REQUEST':
        throw responseErrorFactory.badRequestResponseError(responseContent);
      case 'INTERNAL_SERVER_ERROR':
        throw responseErrorFactory.internalServerErrorResponseError(
          responseContent
        );
      default:
        throw responseErrorFactory.unauthorizedResponseError();
    }
  };
};
