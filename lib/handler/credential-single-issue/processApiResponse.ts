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

import { CredentialSingleIssueResponse } from '@vecrea/au3te-ts-common/schemas.credential-single-issue';
import {
  CreateProcessApiResponseParams,
  ProcessApiResponse,
} from '../core/processApiResponse';
import { CredentialApiOptions } from '../credential/types';
import { ApiResponseWithOptions } from '../core/types';

export const createProcessApiResponse =
  ({
    path,
    buildUnknownActionMessage,
    responseFactory,
    responseErrorFactory,
  }: CreateProcessApiResponseParams): ProcessApiResponse<
    ApiResponseWithOptions<CredentialSingleIssueResponse, CredentialApiOptions>
  > =>
  async (apiResponseWithOptions) => {
    const { apiResponse, options } = apiResponseWithOptions;
    const { action, responseContent } = apiResponse;
    const { headers, accessToken } = options ?? {};

    switch (action) {
      case 'CALLER_ERROR':
        throw responseErrorFactory.internalServerErrorResponseError(
          responseContent,
          headers
        );

      case 'BAD_REQUEST':
        throw responseErrorFactory.badRequestResponseError(
          responseContent,
          headers
        );

      case 'UNAUTHORIZED':
        throw responseErrorFactory.unauthorizedResponseError(
          accessToken,
          responseContent,
          headers
        );

      case 'FORBIDDEN':
        throw responseErrorFactory.forbiddenResponseError(
          responseContent,
          headers
        );

      case 'OK':
        return responseFactory.ok(responseContent, headers);

      case 'OK_JWT':
        return responseFactory.okJwt(responseContent, headers);

      case 'ACCEPTED':
        return responseFactory.accepted(responseContent, headers);

      case 'ACCEPTED_JWT':
        return responseFactory.acceptedJwt(responseContent, headers);

      case 'INTERNAL_SERVER_ERROR':
        throw responseErrorFactory.internalServerErrorResponseError(
          responseContent,
          headers
        );
      default:
        throw responseErrorFactory.internalServerErrorResponseError(
          buildUnknownActionMessage(path, action),
          headers
        );
    }
  };
