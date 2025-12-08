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

import { AuthorizationIssueRequest } from '@vecrea/au3te-ts-common/schemas.authorization-issue';
import { ProcessRequest, CreateProcessRequestParams } from '../core';
import { ToApiRequest } from '../core/toApiRequest';
import { CollectClaims } from './collectClaims';
import {
  GetOrAuthenticateUser,
  GetOrAuthenticateUserFactory,
} from './getOrAuthenticateUser';
import { CreateToApiRequestParams } from './toApiRequest';
import { SessionSchemas } from '../../session/types';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

/**
 * Interface defining the configuration for the Authorization Decision handler.
 * This handler handles user decisions on authorization requests.
 */
export interface AuthorizationDecisionHandlerConfiguration {
  /**
   * The path for the authorization decision endpoint.
   */
  path: string;
  /**
   * Function to collect claims for the user based on requested scopes and claim names.
   */
  collectClaims: CollectClaims;

  /**
   * Function to get an authenticated user or perform authentication if needed.
   */
  getOrAuthenticateUser: GetOrAuthenticateUser;

  /**
   * Function to convert an HTTP request to an AuthorizationIssueRequest.
   */
  toApiRequest: ToApiRequest<AuthorizationIssueRequest>;

  /**
   * Function to process incoming HTTP requests to the authorization decision endpoint.
   * Takes a Request object and returns a Promise resolving to a Response.
   */
  processRequest: ProcessRequest;
}

/**
 * Factories and direct override hooks for customizing the authorization decision handler.
 */
export type AuthorizationDecisionHandlerOverrideFactories<
  U extends User = User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  createToApiRequest?: (
    params: CreateToApiRequestParams<SessionSchemas>
  ) => ToApiRequest<AuthorizationIssueRequest>;
  createProcessRequest?: (
    params: CreateProcessRequestParams<AuthorizationIssueRequest>
  ) => ProcessRequest;
  createGetOrAuthenticateUser?: GetOrAuthenticateUserFactory<U, T>;
};
