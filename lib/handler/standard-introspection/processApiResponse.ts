/*
 * Copyright (C) 2017-2023 Authlete, Inc.
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
import { StandardIntrospectionResponse } from '@vecrea/au3te-ts-common/schemas.standard-introspection';
import { CreateProcessApiResponseParams, ProcessApiResponse } from '../core';

/**
 * Interface for creating a `ProcessApiResponse` function for Standard Introspection.
 *
 * @param {CreateProcessApiResponseParams} params - The parameters for creating the function.
 * @returns {ProcessApiResponse<StandardIntrospectionResponse>} The created `ProcessApiResponse` function.
 */
export interface CreateProcessApiResponse {
  (
    params: CreateProcessApiResponseParams
  ): ProcessApiResponse<StandardIntrospectionResponse>;
}

/**
 * Creates a `ProcessApiResponse` function that processes the `StandardIntrospectionResponse` from Authlete.
 *
 * The function handles different actions returned by Authlete:
 * - `OK`: Returns a 200 OK response with the content.
 * - `JWT`: Returns a 200 OK response with `application/token-introspection+jwt` content type.
 * - `BAD_REQUEST`: Throws a Bad Request error.
 * - `INTERNAL_SERVER_ERROR`: Throws an Internal Server Error.
 * - `default`: Throws an Unauthorized error.
 *
 * @param {CreateProcessApiResponseParams} params - The parameters for creating the function.
 * @returns {ProcessApiResponse<StandardIntrospectionResponse>} The `ProcessApiResponse` function.
 */
export const createProcessApiResponse: CreateProcessApiResponse = ({
  responseFactory,
  responseErrorFactory,
}) => {
  return async (apiResponse: StandardIntrospectionResponse) => {
    const { action, responseContent } = apiResponse;

    switch (action) {
      case 'OK':
        return responseFactory.ok(responseContent);
      case 'JWT':
        return responseFactory.okIntrospectionJwt(responseContent);
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
