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
  authorizationResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.authorization';
import type { ApiClient } from '@vecrea/au3te-ts-common/api';
import {
  ProcessApiRequest,
  createProcessApiRequest,
} from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import {
  createHandleWithOptions,
  HandleWithOptions,
  CreateHandleWithOptionsParams,
} from '../core/handleWithOptions';
import { ApiResponseWithOptions } from '../core/types';
import { SessionSchemas } from '../../session/types';
import {
  createGenerateAuthorizationPage,
  GenerateAuthorizationPage,
  CreateGenerateAuthorizationPageParams,
} from './generateAuthorizationPage';
import {
  createHandleNoInteraction,
  HandleNoInteraction,
  CreateHandleNoInteractionParams,
} from './handleNoInteraction';
import {
  defaultResponseToDecisionParams,
  ResponseToDecisionParams,
} from './responseToDecisionParams';
import {
  ClearCurrentUserInfoInSessionIfNecessary,
  createClearCurrentUserInfoInSessionIfNecessary,
  CreateClearCurrentUserInfoInSessionIfNecessaryParams,
} from './clearCurrentUserInfoInSessionIfNecessary';
import { BuildResponse, simpleBuildResponse } from './buildResponse';
import { CheckPrompts, defaultCheckPrompts } from './checkPrompts';
import { CheckAuthAge, defaultCheckAuthAge } from './checkAuthAge';
import {
  ClearCurrentUserInfoInSession,
  defaultClearCurrentUserInfoInSession,
} from './clearCurrentUserInfoInSession';
import { CheckSubject, defaultCheckSubject } from './checkSubject';
import { CalcSub, defaultCalcSub } from './calcSub';
import {
  createProcessApiResponse,
  CreateProcessApiResponseParams4Authorization,
} from './processApiResponse';
import { AuthorizationHandlerConfiguration } from './AuthorizationHandlerConfiguration';
import { AuthorizationIssueHandlerConfiguration } from '../authorization-issue/AuthorizationIssueHandlerConfiguration';
import { AuthorizationFailHandlerConfiguration } from '../authorization-fail/AuthorizationFailHandlerConfiguration';
import { AuthorizationPageHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { ToApiRequest } from '../core/toApiRequest';
import {
  ProcessRequestWithOptions,
  CreateProcessRequestWithOptionsParams,
} from '../core';
import { createToApiRequest, CreateToApiRequestParams } from './toApiRequest';
import { createProcessRequestWithOptions } from '../core/processRequestWithOptions';
import { ApiRequestWithOptions } from '../core/types';
import { ExtractorConfiguration } from '../../extractor/ExtractorConfiguration';

/**
 * Parameters for constructing AuthorizationHandlerConfigurationImpl.
 * @template SS - The type of session schemas, extending SessionSchemas.
 * @template OPTS - The type of handler options.
 */
export type AuthorizationHandlerConfigurationImplConstructorParams<
  SS extends SessionSchemas,
  OPTS = unknown
> = {
  /** Server handler configuration */
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  /** Authorization issue handler configuration */
  authorizationIssueHandlerConfiguration: AuthorizationIssueHandlerConfiguration;
  /** Authorization fail handler configuration */
  authorizationFailHandlerConfiguration: AuthorizationFailHandlerConfiguration;
  /** Authorization page handler configuration */
  authorizationPageHandlerConfiguration: AuthorizationPageHandlerConfiguration;
  /** Extractor configuration */
  extractorConfiguration: ExtractorConfiguration;
  /** Overrides for extending handler behaviour */
  overrides?: AuthorizationHandlerConfigurationImplOverrides<SS, OPTS>;
};

export type ProcessApiRequestFactory = (
  path: string,
  schema: typeof authorizationResponseSchema,
  apiClient: ApiClient
) => ProcessApiRequest<AuthorizationRequest, AuthorizationResponse>;

export type ClearCurrentUserInfoInSessionIfNecessaryFactory<
  SS extends SessionSchemas
> = (
  params: CreateClearCurrentUserInfoInSessionIfNecessaryParams<SS>
) => ClearCurrentUserInfoInSessionIfNecessary<SS>;

export type GenerateAuthorizationPageFactory<
  SS extends SessionSchemas,
  OPTS = unknown
> = (
  params: CreateGenerateAuthorizationPageParams<SS>
) => GenerateAuthorizationPage<SS, OPTS>;

export type HandleNoInteractionFactory<SS extends SessionSchemas> = (
  params: CreateHandleNoInteractionParams
) => HandleNoInteraction<SS>;

export type ProcessApiResponseFactory<SS extends SessionSchemas, OPTS = unknown> = (
  params: CreateProcessApiResponseParams4Authorization<SS, OPTS>
) => ProcessApiResponse<ApiResponseWithOptions<AuthorizationResponse, OPTS>, OPTS>;

export type HandleFactory<OPTS = unknown> = (
  params: CreateHandleWithOptionsParams<
    AuthorizationRequest,
    AuthorizationResponse,
    OPTS
  >
) => HandleWithOptions<AuthorizationRequest, OPTS>;

export type ToApiRequestFactory<OPTS = unknown> = (
  params: CreateToApiRequestParams
) => ToApiRequest<ApiRequestWithOptions<AuthorizationRequest, OPTS>>;

export type ProcessRequestFactory<OPTS = unknown> = (
  params: CreateProcessRequestWithOptionsParams<AuthorizationRequest, OPTS>
) => ProcessRequestWithOptions<OPTS>;

export type AuthorizationHandlerConfigurationImplOverrides<
  SS extends SessionSchemas,
  OPTS = unknown
> = {
  createProcessApiRequest?: ProcessApiRequestFactory;
  processApiRequest?: ProcessApiRequest<
    AuthorizationRequest,
    AuthorizationResponse
  >;
  responseToDecisionParams?: ResponseToDecisionParams;
  checkPrompts?: CheckPrompts;
  checkAuthAge?: CheckAuthAge;
  clearCurrentUserInfoInSession?: ClearCurrentUserInfoInSession<SS>;
  createClearCurrentUserInfoInSessionIfNecessary?: ClearCurrentUserInfoInSessionIfNecessaryFactory<SS>;
  clearCurrentUserInfoInSessionIfNecessary?: ClearCurrentUserInfoInSessionIfNecessary<SS>;
  buildResponse?: BuildResponse;
  createGenerateAuthorizationPage?: GenerateAuthorizationPageFactory<SS, OPTS>;
  generateAuthorizationPage?: GenerateAuthorizationPage<SS, OPTS>;
  checkSubject?: CheckSubject;
  calcSub?: CalcSub;
  createHandleNoInteraction?: HandleNoInteractionFactory<SS>;
  handleNoInteraction?: HandleNoInteraction<SS>;
  createProcessApiResponse?: ProcessApiResponseFactory<SS, OPTS>;
  processApiResponse?: ProcessApiResponse<
    ApiResponseWithOptions<AuthorizationResponse, OPTS>,
    OPTS
  >;
  createHandle?: HandleFactory<OPTS>;
  handle?: HandleWithOptions<AuthorizationRequest, OPTS>;
  createToApiRequest?: ToApiRequestFactory<OPTS>;
  toApiRequest?: ToApiRequest<ApiRequestWithOptions<AuthorizationRequest, OPTS>>;
  createProcessRequest?: ProcessRequestFactory<OPTS>;
  processRequest?: ProcessRequestWithOptions<OPTS>;
};

/** The path for the authorization endpoint */
export const AUTHORIZATION_PATH = '/api/authorization';

/**
 * Implementation of the AuthorizationHandlerConfiguration interface.
 * @template SS - The type of session schemas, extending SessionSchemas.
 * @template OPTS - The type of handler options.
 * @implements {AuthorizationHandlerConfiguration<SS, OPTS>}
 */
export class AuthorizationHandlerConfigurationImpl<
  SS extends SessionSchemas,
  OPTS = unknown
> implements AuthorizationHandlerConfiguration<SS, OPTS>
{
  /** The path for the authorization endpoint */
  path = AUTHORIZATION_PATH;

  /** Function to process the API request for authorization */
  processApiRequest: ProcessApiRequest<
    AuthorizationRequest,
    AuthorizationResponse
  >;

  /** Parameters for response to decision */
  responseToDecisionParams: ResponseToDecisionParams;

  /** Function to check prompts */
  checkPrompts: CheckPrompts;

  /** Function to check authentication age */
  checkAuthAge: CheckAuthAge;

  /** Function to clear current user info in session */
  clearCurrentUserInfoInSession: ClearCurrentUserInfoInSession<SS>;

  /** Function to clear current user info in session if necessary */
  clearCurrentUserInfoInSessionIfNecessary: ClearCurrentUserInfoInSessionIfNecessary<SS>;

  /** Function to build a response */
  buildResponse: BuildResponse;

  /** Function to generate the authorization page */
  generateAuthorizationPage: GenerateAuthorizationPage<SS, OPTS>;

  /** Function to check the subject */
  checkSubject: CheckSubject;

  /** Function to calculate the subject */
  calcSub: CalcSub;

  /** Function to handle no interaction cases */
  handleNoInteraction: HandleNoInteraction<SS>;

  /** Function to process the API response for authorization */
  processApiResponse: ProcessApiResponse<
    ApiResponseWithOptions<AuthorizationResponse, OPTS>,
    OPTS
  >;

  /** Function to handle the authorization request */
  handle: HandleWithOptions<AuthorizationRequest, OPTS>;

  /** Function to convert HTTP requests to API requests */
  toApiRequest: ToApiRequest<ApiRequestWithOptions<AuthorizationRequest, OPTS>>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequestWithOptions<OPTS>;

  /**
   * Creates an instance of AuthorizationHandlerConfigurationImpl.
   * @param {AuthorizationHandlerConfigurationImplConstructorParams<SS, OPTS>} params - The parameters for constructing the instance.
   */
  constructor({
    serverHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
    authorizationPageHandlerConfiguration,
    extractorConfiguration,
    overrides,
  }: AuthorizationHandlerConfigurationImplConstructorParams<SS, OPTS>) {
    const {
      apiClient,
      session,
      buildUnknownActionMessage,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    const resolvedOverrides =
      overrides ??
      ({} as AuthorizationHandlerConfigurationImplOverrides<SS, OPTS>);

    this.processApiRequest =
      resolvedOverrides.processApiRequest ??
      (
        resolvedOverrides.createProcessApiRequest ??
        (createProcessApiRequest as ProcessApiRequestFactory)
      )(apiClient.authorizationPath, authorizationResponseSchema, apiClient);

    this.responseToDecisionParams =
      resolvedOverrides.responseToDecisionParams ??
      defaultResponseToDecisionParams;

    this.checkPrompts = resolvedOverrides.checkPrompts ?? defaultCheckPrompts;

    this.checkAuthAge = resolvedOverrides.checkAuthAge ?? defaultCheckAuthAge;

    this.clearCurrentUserInfoInSession =
      resolvedOverrides.clearCurrentUserInfoInSession ??
      (defaultClearCurrentUserInfoInSession as unknown as ClearCurrentUserInfoInSession<SS>);

    this.clearCurrentUserInfoInSessionIfNecessary =
      resolvedOverrides.clearCurrentUserInfoInSessionIfNecessary ??
      (
        resolvedOverrides.createClearCurrentUserInfoInSessionIfNecessary ??
        (createClearCurrentUserInfoInSessionIfNecessary as ClearCurrentUserInfoInSessionIfNecessaryFactory<SS>)
      )({
        checkPrompts: this.checkPrompts,
        checkAuthAge: this.checkAuthAge,
        clearCurrentUserInfoInSession: this.clearCurrentUserInfoInSession,
      });

    this.buildResponse = resolvedOverrides.buildResponse ?? simpleBuildResponse;

    this.generateAuthorizationPage =
      resolvedOverrides.generateAuthorizationPage ??
      (
        resolvedOverrides.createGenerateAuthorizationPage ??
        (createGenerateAuthorizationPage as GenerateAuthorizationPageFactory<
          SS,
          OPTS
        >)
      )({
        responseToDecisionParams: this.responseToDecisionParams,
        buildAuthorizationPageModel:
          authorizationPageHandlerConfiguration.buildAuthorizationPageModel,
        clearCurrentUserInfoInSessionIfNecessary:
          this.clearCurrentUserInfoInSessionIfNecessary,
        buildResponse: this.buildResponse,
      });

    this.checkSubject = resolvedOverrides.checkSubject ?? defaultCheckSubject;

    this.calcSub = resolvedOverrides.calcSub ?? defaultCalcSub;

    this.handleNoInteraction =
      resolvedOverrides.handleNoInteraction ??
      (
        resolvedOverrides.createHandleNoInteraction ??
        (createHandleNoInteraction as HandleNoInteractionFactory<SS>)
      )({
        checkAuthAge: this.checkAuthAge,
        checkSubject: this.checkSubject,
        calcSub: this.calcSub,
        buildAuthorizationFailError:
          authorizationFailHandlerConfiguration.buildAuthorizationFailError,
        handle4AuthorizationIssue:
          authorizationIssueHandlerConfiguration.handle,
      });

    this.processApiResponse =
      resolvedOverrides.processApiResponse ??
      (
        resolvedOverrides.createProcessApiResponse ??
        createProcessApiResponse<SS, OPTS>
      )({
        session,
        path: this.path,
        generateAuthorizationPage: this.generateAuthorizationPage,
        handleNoInteraction: this.handleNoInteraction,
        buildUnknownActionMessage,
        responseFactory,
        responseErrorFactory,
      });

    this.handle =
      resolvedOverrides.handle ??
      (
        resolvedOverrides.createHandle ??
        createHandleWithOptions<
          AuthorizationRequest,
          AuthorizationResponse,
          OPTS
        >
      )({
        path: this.path,
        processApiRequest: this.processApiRequest,
        processApiResponse: this.processApiResponse,
        recoverResponseResult,
      });

    this.toApiRequest =
      resolvedOverrides.toApiRequest ??
      (
        resolvedOverrides.createToApiRequest ??
        createToApiRequest<OPTS>
      )({
        extractParameters: extractorConfiguration.extractParameters,
      });

    this.processRequest =
      resolvedOverrides.processRequest ??
      (
        resolvedOverrides.createProcessRequest ??
        createProcessRequestWithOptions<AuthorizationRequest, OPTS>
      )({
        path: this.path,
        toApiRequest: this.toApiRequest,
        handle: this.handle,
        recoverResponseResult,
      });
  }
}
