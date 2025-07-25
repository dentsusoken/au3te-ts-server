/*
 * Copyright (C) 2019-2024 Authlete, Inc.
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

import { AuthorizationFailResponse } from '@vecrea/au3te-ts-common/schemas.authorization-fail';
import {
  ProcessApiResponse,
  CreateProcessApiResponseParams,
} from '../core/processApiResponse';

export const createProcessApiResponse =
  ({
    path,
    buildUnknownActionMessage,
    responseFactory,
    responseErrorFactory,
  }: CreateProcessApiResponseParams): ProcessApiResponse<AuthorizationFailResponse> =>
  async (apiResponse: AuthorizationFailResponse): Promise<Response> => {
    const { action, responseContent } = apiResponse;

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
      default:
        throw responseErrorFactory.internalServerErrorResponseError(
          buildUnknownActionMessage(path, action)
        );
    }
  };
