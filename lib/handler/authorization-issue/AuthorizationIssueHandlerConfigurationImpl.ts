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
  AuthorizationIssueRequest,
  AuthorizationIssueResponse,
  authorizationIssueResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.authorization-issue';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { AuthorizationIssueHandlerConfiguration } from './AuthorizationIssueHandlerConfiguration';

/** The path for the authorization issue endpoint */
export const AUTHORIZATION_ISSUE_PATH = '/api/authorization/issue';
/**
 * Implementation of the AuthorizationIssueHandlerConfiguration interface.
 * This class configures the handling of authorization issue requests.
 */
export class AuthorizationIssueHandlerConfigurationImpl<
  SS extends DefaultSessionSchemas
> implements AuthorizationIssueHandlerConfiguration
{
  /** The path for the authorization issue endpoint. */
  path: string = AUTHORIZATION_ISSUE_PATH;

  /** Function to process the API request for authorization issue. */
  processApiRequest: ProcessApiRequest<
    AuthorizationIssueRequest,
    AuthorizationIssueResponse
  >;

  /** Function to process the API response for authorization issue. */
  processApiResponse: ProcessApiResponse<AuthorizationIssueResponse>;

  /** Function to handle the authorization issue request. */
  handle: Handle<AuthorizationIssueRequest>;

  /**
   * Creates an instance of AuthorizationIssueHandlerConfigurationImpl.
   * @param {ServerHandlerConfiguration<SS>} serverHandlerConfiguration - The server handler configuration.
   */
  constructor(serverHandlerConfiguration: ServerHandlerConfiguration<SS>) {
    const {
      apiClient,
      buildUnknownActionMessage,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.authorizationIssuePath,
      authorizationIssueResponseSchema,
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
  }
}
