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
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { AuthorizationIssueHandlerConfiguration } from '../authorization-issue';
import { createProcessRequest, ProcessRequest } from '../core';
import {
  AuthorizationDecisionHandlerConfiguration,
  AuthorizationDecisionHandlerOverrideFactories,
} from './AuthorizationDecisionHandlerConfiguration';
import { createToApiRequest } from './toApiRequest';
import { ToApiRequest } from '../core/toApiRequest';
import { ExtractorConfiguration } from '../../extractor/ExtractorConfiguration';
import { CollectClaims, defaultCollectClaims } from './collectClaims';
import {
  GetOrAuthenticateUser,
  createGetOrAuthenticateUser,
} from './getOrAuthenticateUser';
import {
  UserHandlerConfiguration,
  GetByCredentials,
} from '@vecrea/au3te-ts-common/handler.user';
import { AuthorizationHandlerConfiguration } from '../authorization/AuthorizationHandlerConfiguration';
import { SessionSchemas } from '../../session/types';
import { AuthorizationFailHandlerConfiguration } from '../authorization-fail';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

export type CreateAuthorizationDecisionHandlerConfigurationImplConstructorParams<
  SS extends SessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'>,
  OPTS = unknown
> = {
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  extractorConfiguration: ExtractorConfiguration;
  userHandlerConfiguration: UserHandlerConfiguration<U, T>;
  authorizationHandlerConfiguration: AuthorizationHandlerConfiguration<
    SS,
    OPTS
  >;
  authorizationIssueHandlerConfiguration: AuthorizationIssueHandlerConfiguration<AuthorizationIssueRequest>;
  authorizationFailHandlerConfiguration: AuthorizationFailHandlerConfiguration;
  overrides?: AuthorizationDecisionHandlerConfigurationImplOverrides<U, T>;
};

export type AuthorizationDecisionHandlerConfigurationImplOverrides<
  U extends User = User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = AuthorizationDecisionHandlerOverrideFactories<U, T> & {
  collectClaims?: CollectClaims;
  toApiRequest?: ToApiRequest<AuthorizationIssueRequest>;
  processRequest?: ProcessRequest;
  getOrAuthenticateUser?: GetOrAuthenticateUser;
};

/** The path for the authorization decision endpoint */
export const AUTHORIZATION_DECISION_PATH = '/api/authorization/decision';

/**
 * Implementation of the Authorization Decision handler configuration.
 * Handles conversion of HTTP requests to Authorization Decision API requests and processes them.
 *
 * @implements {AuthorizationDecisionHandlerConfiguration}
 */
export class AuthorizationDecisionHandlerConfigurationImpl<
  SS extends SessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'>,
  OPTS = unknown
> implements AuthorizationDecisionHandlerConfiguration
{
  /** The path for the authorization decision endpoint */
  path: string = AUTHORIZATION_DECISION_PATH;

  /** Function to collect claims for the user based on requested scopes and claim names */
  collectClaims: CollectClaims = defaultCollectClaims;

  /** Function to get an authenticated user or perform authentication if needed */
  getOrAuthenticateUser: GetOrAuthenticateUser;

  /** Function to convert HTTP requests to Authorization Decision API requests */
  toApiRequest: ToApiRequest<AuthorizationIssueRequest>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequest;

  /**
   * Creates a new Authorization Decision endpoint configuration instance.
   *
   * @param params - Configuration parameters
   */
  constructor({
    serverHandlerConfiguration,
    extractorConfiguration,
    userHandlerConfiguration,
    authorizationHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
    overrides,
  }: CreateAuthorizationDecisionHandlerConfigurationImplConstructorParams<
    SS,
    U,
    T,
    OPTS
  >) {
    const { recoverResponseResult, responseErrorFactory, session } =
      serverHandlerConfiguration;

    const resolvedOverrides =
      overrides ??
      ({} as AuthorizationDecisionHandlerConfigurationImplOverrides<U, T>);

    this.collectClaims =
      resolvedOverrides.collectClaims ?? defaultCollectClaims;

    this.getOrAuthenticateUser =
      resolvedOverrides.getOrAuthenticateUser ??
      (
        resolvedOverrides.createGetOrAuthenticateUser ??
        createGetOrAuthenticateUser<U, T>
      )(userHandlerConfiguration.getByCredentials as GetByCredentials<U, T>);

    this.toApiRequest =
      resolvedOverrides.toApiRequest ??
      (resolvedOverrides.createToApiRequest ?? createToApiRequest)({
        session,
        extractParameters: extractorConfiguration.extractParameters,
        getOrAuthenticateUser: this.getOrAuthenticateUser,
        buildAuthorizationFailError:
          authorizationFailHandlerConfiguration.buildAuthorizationFailError,
        calcSub: authorizationHandlerConfiguration.calcSub,
        collectClaims: this.collectClaims,
        responseErrorFactory,
      });

    this.processRequest =
      resolvedOverrides.processRequest ??
      (resolvedOverrides.createProcessRequest ?? createProcessRequest)({
        path: this.path,
        toApiRequest: this.toApiRequest,
        handle: authorizationIssueHandlerConfiguration.handle,
        recoverResponseResult,
      });
  }
}
