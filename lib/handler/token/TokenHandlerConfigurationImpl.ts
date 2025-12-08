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
  TokenRequest,
  TokenResponse,
  tokenResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.token';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { SessionSchemas } from '../../session/types';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { TokenHandlerConfiguration } from './TokenHandlerConfiguration';
import { createHandlePassword } from './handlePassword';
import { createHandleTokenCreate } from './handleTokenCreate';
import { createResponseToCreateRequest } from './responseToCreateRequest';
import { defaultDetermineSubject4TokenExchange } from './determineSubject4TokenExchange';
import { defaultDetermineSubject4JwtBearer } from './determineSubject4JwtBearer';
import { DetermineSubject } from './determineSubject';
import { HandlePassword } from './handlePassword';
import { HandleTokenCreate } from './handleTokenCreate';
import { ResponseToCreateRequest } from './responseToCreateRequest';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { TokenFailHandlerConfiguration } from '../token-fail/TokenFailHandlerConfiguration';
import { TokenIssueHandlerConfiguration } from '../token-issue/TokenIssueHandlerConfiguration';
import { TokenCreateHandlerConfiguration } from '../token-create/TokenCreateHandlerConfiguration';
import { ToApiRequest } from '../core/toApiRequest';
import { ProcessRequest } from '../core/processRequest';
import { createToApiRequest } from '../core/toClientAuthRequest';
import { createProcessRequest } from '../core/processRequest';
import { ExtractorConfiguration } from '../../extractor/ExtractorConfiguration';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

/**
 * Configuration parameters for TokenHandlerConfigurationImpl constructor.
 * Provides all necessary configurations for handling token endpoint operations.
 */
type TokenHandlerConfigurationImplConstructorParams<
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  /** Server configuration for common handler operations */
  serverHandlerConfiguration: ServerHandlerConfiguration<SessionSchemas>;

  /** Configuration for user authentication and management */
  userHandlerConfiguration: UserHandlerConfiguration<U, T>;

  /** Configuration for handling token operation failures */
  tokenFailHandlerConfiguration: TokenFailHandlerConfiguration;

  /** Configuration for token issuance operations */
  tokenIssueHandlerConfiguration: TokenIssueHandlerConfiguration;

  /** Configuration for token creation operations */
  tokenCreateHandlerConfiguration: TokenCreateHandlerConfiguration;

  /** Configuration for converting HTTP requests to Token API requests */
  extractorConfiguration: ExtractorConfiguration;
};

/** The path for the token endpoint */
export const TOKEN_PATH = '/api/token';

/**
 * Implementation of the TokenHandlerConfiguration interface.
 * Handles token endpoint operations according to OAuth 2.0 and OpenID Connect specifications.
 *
 * Supports the following grant types:
 * - Resource Owner Password Credentials grant (RFC 6749)
 * - Token Exchange (RFC 8693)
 * - JWT Bearer Token (RFC 7523)
 *
 * This class coordinates various token-related operations:
 * - User authentication and validation
 * - Token creation and exchange
 * - Token issuance and response handling
 * - Error handling and recovery
 *
 * @implements {TokenHandlerConfiguration}
 */
export class TokenHandlerConfigurationImpl<
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> implements TokenHandlerConfiguration
{
  /** The path for the token endpoint. Default is '/api/token'. */
  path: string = TOKEN_PATH;

  /** Function to determine the subject identifier from a token exchange response. */
  determineSubject4TokenExchange: DetermineSubject;

  /** Function to determine the subject identifier from a JWT Bearer token response. */
  determineSubject4JwtBearer: DetermineSubject;

  /** Handler for processing Resource Owner Password Credentials grant requests. */
  handlePassword: HandlePassword;

  /** Handler for processing token exchange requests according to RFC 8693. */
  handleTokenExchange: HandleTokenCreate;

  /** Handler for processing JWT Bearer token requests according to RFC 7523. */
  handleJwtBearer: HandleTokenCreate;

  /** Function to convert token exchange responses to token creation requests. */
  responseToCreateRequest4TokenExchange: ResponseToCreateRequest;

  /** Function to convert JWT Bearer responses to token creation requests. */
  responseToCreateRequest4JwtBearer: ResponseToCreateRequest;

  /** Function to process and validate token API requests before sending to the authorization server. */
  processApiRequest: ProcessApiRequest<TokenRequest, TokenResponse>;

  /** Function to process token API responses and handle different grant type scenarios. */
  processApiResponse: ProcessApiResponse<TokenResponse>;

  /** Main handler function that orchestrates the token request processing flow. */
  handle: Handle<TokenRequest>;

  /** Function to convert HTTP requests to standardized Token API request format. */
  toApiRequest: ToApiRequest<TokenRequest>;

  /** Function to process incoming HTTP requests and prepare them for token operations. */
  processRequest: ProcessRequest;

  /**
   * Creates an instance of TokenHandlerConfigurationImpl.
   * @param {TokenHandlerConfigurationImplConstructorParams} params - Configuration parameters
   */
  constructor({
    serverHandlerConfiguration,
    userHandlerConfiguration,
    tokenFailHandlerConfiguration,
    tokenIssueHandlerConfiguration,
    tokenCreateHandlerConfiguration,
    extractorConfiguration,
  }: TokenHandlerConfigurationImplConstructorParams<U, T>) {
    const {
      apiClient,
      buildUnknownActionMessage,
      recoverResponseResult,
      prepareHeaders,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.tokenPath,
      tokenResponseSchema,
      apiClient
    );

    // Initialize subject determination functions
    this.determineSubject4TokenExchange = defaultDetermineSubject4TokenExchange;
    this.determineSubject4JwtBearer = defaultDetermineSubject4JwtBearer;

    // Initialize response to request conversion functions
    this.responseToCreateRequest4TokenExchange = createResponseToCreateRequest({
      grantType: 'urn:ietf:params:oauth:grant-type:token-exchange',
      determineSubject: this.determineSubject4TokenExchange,
      responseErrorFactory,
    });

    this.responseToCreateRequest4JwtBearer = createResponseToCreateRequest({
      grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      determineSubject: this.determineSubject4JwtBearer,
      responseErrorFactory,
    });

    // Create handlers using the initialized functions
    this.handlePassword = createHandlePassword({
      getByCredentials: userHandlerConfiguration.getByCredentials,
      handle4TokenIssue: tokenIssueHandlerConfiguration.handle,
      buildTokenFailError: tokenFailHandlerConfiguration.buildTokenFailError,
    });

    this.handleTokenExchange = createHandleTokenCreate({
      responseToCreateRequest: this.responseToCreateRequest4TokenExchange,
      handle4TokenCreate: tokenCreateHandlerConfiguration.handle,
    });

    this.handleJwtBearer = createHandleTokenCreate({
      responseToCreateRequest: this.responseToCreateRequest4JwtBearer,
      handle4TokenCreate: tokenCreateHandlerConfiguration.handle,
    });

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage,
      prepareHeaders,
      handlePassword: this.handlePassword,
      handleTokenExchange: this.handleTokenExchange,
      handleJwtBearer: this.handleJwtBearer,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = createHandle({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.toApiRequest = createToApiRequest({
      extractParameters: extractorConfiguration.extractParameters,
      extractClientCredentials: extractorConfiguration.extractClientCredentials,
      extractClientCertificateAndPath:
        extractorConfiguration.extractClientCertificateAndPath,
    });

    this.processRequest = createProcessRequest({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
