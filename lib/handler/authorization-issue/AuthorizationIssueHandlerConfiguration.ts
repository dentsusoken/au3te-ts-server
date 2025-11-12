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

import {
  AuthorizationIssueRequest,
  AuthorizationIssueResponse,
} from '@vecrea/au3te-ts-common/schemas.authorization-issue';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { Handle } from '../core/handle';

/**
 * Configuration interface for the Authorization Issue handler.
 */
export interface AuthorizationIssueHandlerConfiguration<
  ISSUE_REQ extends object = AuthorizationIssueRequest
> {
  /**
   * The path for the authorization issue endpoint.
   */
  path: string;

  /**
   * Function to process the API request for authorization issue.
   */
  processApiRequest: ProcessApiRequest<
    AuthorizationIssueRequest,
    AuthorizationIssueResponse
  >;

  /**
   * Function to process the API response for authorization issue.
   */
  processApiResponse: ProcessApiResponse<AuthorizationIssueResponse>;

  /**
   * Function to handle the authorization issue request.
   */
  handle: Handle<ISSUE_REQ>;
}
