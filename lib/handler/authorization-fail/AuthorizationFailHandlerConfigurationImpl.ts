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

import type { DefaultSessionSchemas } from '../../session/sessionSchemas';
import {
  AuthorizationFailRequest,
  AuthorizationFailResponse,
  authorizationFailResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.authorization-fail';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { AuthorizationFailHandlerConfiguration } from './AuthorizationFailHandlerConfiguration';
import {
  BuildAuthorizationFailError,
  createBuildAuthorizationFailError,
} from './buildAuthorizationFailError';

/** The path for the authorization fail endpoint */
export const AUTHORIZATION_FAIL_PATH = '/api/authorization/fail';

/**
 * Implementation of the AuthorizationFailHandlerConfiguration interface.
 * This class configures and handles Authorization Fail requests.
 */
export class AuthorizationFailHandlerConfigurationImpl
  implements AuthorizationFailHandlerConfiguration
{
  /** The path for the authorization fail endpoint. */
  path: string = AUTHORIZATION_FAIL_PATH;

  /** Function to process the API request for authorization fail. */
  processApiRequest: ProcessApiRequest<
    AuthorizationFailRequest,
    AuthorizationFailResponse
  >;

  /** Function to process the API response for authorization fail. */
  processApiResponse: ProcessApiResponse<AuthorizationFailResponse>;

  /** Function to handle the authorization fail request. */
  handle: Handle<AuthorizationFailRequest>;

  /** Function to build an error response for authorization fail. */
  buildAuthorizationFailError: BuildAuthorizationFailError;

  /**
   * Creates an instance of AuthorizationFailHandlerConfigurationImpl.
   * @param {ServerHandlerConfiguration<DefaultSessionSchemas>} serverHandlerConfiguration - The server handler configuration.
   */
  constructor(
    serverHandlerConfiguration: ServerHandlerConfiguration<DefaultSessionSchemas>
  ) {
    const {
      apiClient,
      buildUnknownActionMessage,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.authorizationFailPath,
      authorizationFailResponseSchema,
      apiClient
    );

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = createHandle({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.buildAuthorizationFailError = createBuildAuthorizationFailError(
      this.handle
    );
  }
}
