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
  AuthorizationRequest,
  AuthorizationResponse,
} from '@vecrea/au3te-ts-common/schemas.authorization';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { HandleWithOptions } from '../core/handleWithOptions';
import { SessionSchemas } from '../../session/types';
import { GenerateAuthorizationPage } from './generateAuthorizationPage';
import { HandleNoInteraction } from './handleNoInteraction';
import { ResponseToDecisionParams } from './responseToDecisionParams';
import { ClearCurrentUserInfoInSessionIfNecessary } from './clearCurrentUserInfoInSessionIfNecessary';
import { BuildResponse } from './buildResponse';
import { CheckPrompts } from './checkPrompts';
import { CheckAuthAge } from './checkAuthAge';
import { ClearCurrentUserInfoInSession } from './clearCurrentUserInfoInSession';
import { CheckSubject } from './checkSubject';
import { CalcSub } from './calcSub';
import { ToApiRequest } from '../core/toApiRequest';
import { ProcessRequestWithOptions } from '../core/processRequestWithOptions';
import { ApiRequestWithOptions, ApiResponseWithOptions } from '../core';

/**
 * Configuration interface for the Authorization handler.
 * @template SS - The type of session schemas in use.
 * @template OPTS - The type of options accepted by the handler.
 */
export interface AuthorizationHandlerConfiguration<
  SS extends SessionSchemas,
  OPTS = unknown
> {
  /**
   * The path for the authorization endpoint.
   */
  path: string;

  /**
   * Function to process the API request for authorization.
   */
  processApiRequest: ProcessApiRequest<
    AuthorizationRequest,
    AuthorizationResponse
  >;

  /**
   * Function to convert authorization response to decision parameters
   */
  responseToDecisionParams: ResponseToDecisionParams;

  /**
   * Function to validate prompt parameters in the authorization request
   */
  checkPrompts: CheckPrompts;

  /**
   * Function to check authentication age
   */
  checkAuthAge: CheckAuthAge;

  /**
   * Function to clear current user information from the session
   */
  clearCurrentUserInfoInSession: ClearCurrentUserInfoInSession<SS>;

  /**
   * Function to conditionally clear current user information from the session
   */
  clearCurrentUserInfoInSessionIfNecessary: ClearCurrentUserInfoInSessionIfNecessary<SS>;

  /**
   * Function to build the authorization response
   */
  buildResponse: BuildResponse;

  /**
   * Function to generate the authorization consent page
   */
  generateAuthorizationPage: GenerateAuthorizationPage<SS, OPTS>;

  /**
   * Function to validate the subject identifier
   */
  checkSubject: CheckSubject;

  /**
   * Function to calculate the subject identifier
   */
  calcSub: CalcSub;

  /**
   * Function to handle no-interaction authorization requests
   */
  handleNoInteraction: HandleNoInteraction<SS>;

  /**
   * Function to process the API response for authorization
   */
  processApiResponse: ProcessApiResponse<ApiResponseWithOptions<AuthorizationResponse, OPTS>, OPTS>;

  /**
   * Function to handle the authorization request
   */
  handle: HandleWithOptions<AuthorizationRequest, OPTS>;

  /**
   * Function to convert an HTTP request to an AuthorizationRequest.
   */
  toApiRequest: ToApiRequest<ApiRequestWithOptions<AuthorizationRequest, OPTS>> 

  /**
   * Function to process incoming HTTP requests to the authorization endpoint.
   */
  processRequest: ProcessRequestWithOptions<OPTS>;
}
