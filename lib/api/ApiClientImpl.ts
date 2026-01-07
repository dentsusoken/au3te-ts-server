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

import { AbstractApiClient } from '@vecrea/au3te-ts-common/api';
import { AuthleteConfiguration } from '@vecrea/au3te-ts-common/conf';
import * as apiPath from './apiPath';

/**
 * Implementation of the ApiClient interface extending AbstractApiClient.
 * This class provides concrete implementations for API client operations.
 * @extends AbstractApiClient
 */
export class ApiClientImpl extends AbstractApiClient {
  /** The base URL for API requests */
  readonly baseUrl: string;

  /** The authorization token for API requests */
  readonly auth: string;

  /** The path for pushed authorization requests */
  readonly pushAuthorizationRequestPath: string;

  /** The path for authorization requests */
  readonly authorizationPath: string;

  /** The path for failed authorization requests */
  readonly authorizationFailPath: string;

  /** The path for authorization issue requests */
  readonly authorizationIssuePath: string;

  /** The path for token requests */
  readonly tokenPath: string;

  /** The path for token issue requests */
  readonly tokenIssuePath: string;

  /** The path for failed token requests */
  readonly tokenFailPath: string;

  /** The path for token create requests */
  readonly tokenCreatePath: string;

  /** The path for introspection requests */
  readonly introspectionPath: string;

  /** The path for service configuration requests */
  readonly serviceConfigurationPath: string;

  /** The path for credential issuer metadata requests */
  readonly credentialIssuerMetadataPath: string;

  /** The path for credential single issue requests */
  readonly credentialSingleIssuePath: string;

  /** The path for credential single parse requests */
  readonly credentialSingleParsePath: string;

  /** The path for get service JWKS requests */
  readonly serviceJwksPath: string;

  /** The path for credential issuer JWKS requests */
  readonly credentialIssuerJwksPath: string;

  /** The path for standard introspection requests */
  readonly standardIntrospectionPath: string;

  /** The path for client registration requests */
  readonly clientRegistrationPath: string;

  /**
   * Creates an instance of ApiClientImpl.
   * @param {AuthleteConfiguration} configuration - The configuration object for Authlete service.
   */
  constructor(protected configuration: AuthleteConfiguration) {
    super();
    this.baseUrl = configuration.baseUrl;
    this.auth = 'Bearer ' + this.configuration.serviceAccessToken;
    this.pushAuthorizationRequestPath = apiPath.pushedAuthReqPath(
      this.configuration.serviceApiKey
    );
    this.authorizationPath = apiPath.authorizationPath(
      this.configuration.serviceApiKey
    );
    this.authorizationFailPath = apiPath.authorizationFailPath(
      this.configuration.serviceApiKey
    );

    this.authorizationIssuePath = apiPath.authorizationIssuePath(
      this.configuration.serviceApiKey
    );

    this.tokenPath = apiPath.tokenPath(this.configuration.serviceApiKey);

    this.tokenIssuePath = apiPath.tokenIssuePath(
      this.configuration.serviceApiKey
    );

    this.tokenFailPath = apiPath.tokenFailPath(
      this.configuration.serviceApiKey
    );

    this.tokenCreatePath = apiPath.tokenCreatePath(
      this.configuration.serviceApiKey
    );

    this.introspectionPath = apiPath.introspectionPath(
      this.configuration.serviceApiKey
    );

    this.serviceConfigurationPath = apiPath.serviceConfigurationPath(
      this.configuration.serviceApiKey
    );

    this.credentialIssuerMetadataPath = apiPath.credentialIssuerMetadataPath(
      this.configuration.serviceApiKey
    );

    this.credentialSingleIssuePath = apiPath.credentialSingleIssuePath(
      this.configuration.serviceApiKey
    );

    this.credentialSingleParsePath = apiPath.credentialSingleParsePath(
      this.configuration.serviceApiKey
    );
    this.serviceJwksPath = apiPath.serviceJwksPath(
      this.configuration.serviceApiKey
    );

    this.credentialIssuerJwksPath = apiPath.credentialIssuerJwksPath(
      this.configuration.serviceApiKey
    );

    this.standardIntrospectionPath = apiPath.standardIntrospectionPath(
      this.configuration.serviceApiKey
    );

    this.clientRegistrationPath = apiPath.clientRegistrationPath(
      this.configuration.serviceApiKey
    );
  }
}
