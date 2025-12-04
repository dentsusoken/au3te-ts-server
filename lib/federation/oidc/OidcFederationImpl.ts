/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Federation } from './Federation';
import { FederationConfig } from '@vecrea/au3te-ts-common/schemas.federation';
import { AuthorizationServer, getValidatedIdTokenClaims } from 'oauth4webapi';
import {
  createFromServerMetadata,
  FromServerMetadata,
} from './fromServerMetadata';
import {
  createFromFederationConfig,
  FromFederationConfig,
} from './fromFederationConfig';
import {
  createGetServerMetadata,
  GetServerMetadata,
} from './getServerMetadata';
import {
  BuildAuthenticationRequest,
  createBuildAuthenticationRequest,
} from './buildAuthenticationRequest';
import {
  createExtractAuthorizationCode,
  ExtractAuthorizationCode,
} from './extractAuthorizationCode';
import { createMakeTokenRequest, MakeTokenRequest } from './makeTokenRequest';
import { ValidateIdToken } from './validateIdToken';
import {
  createMakeUserInfoRequest,
  MakeUserInfoRequest,
} from './makeUserInfoRequest';
import {
  createCreateFederationRequest,
  CreateFederationRequest,
} from './createFederationRequest';
import {
  createProcessFederationResponse,
  ProcessFederationResponse,
} from './processFederationResponse';
import { createBuildAuthenticationRequestScope } from './buildAuthenticationRequestScope';

/**
 * Implementation of the Federation interface.
 * Manages configuration and operations for federating with an external identity provider.
 *
 * This class initializes all federation-related functions based on the provided configuration
 * and handles caching of server metadata for efficient operation.
 *
 * @example
 * ```ts
 * const config: FederationConfig = {
 *   id: 'google',
 *   client: {
 *     clientId: 'client-id',
 *     clientSecret: 'secret',
 *     redirectUri: 'https://example.com/callback',
 *   },
 *   server: {
 *     issuer: 'https://accounts.google.com',
 *     name: 'Google',
 *   },
 * };
 * const federation = new FederationImpl(config, false);
 * ```
 */
export class FederationImpl implements Federation {
  #config: FederationConfig;
  #serverMetadata?: AuthorizationServer;

  fromFederationConfig: FromFederationConfig;
  issuer: () => URL;
  clientId: () => string;
  clientSecret: () => string | undefined;
  redirectUri: () => URL;
  idTokenSignedResponseAlg: () => string | undefined | null;
  getServerMetadata: GetServerMetadata;
  fromServerMetadata: FromServerMetadata;
  authorizationEndpoint: () => Promise<URL>;
  tokenEndpoint: () => Promise<URL>;
  userInfoEndpoint: () => Promise<URL>;
  jwksUri: () => Promise<URL>;
  authorizationResponseIssParameterSupported: () => Promise<boolean>;
  buildAuthenticationRequest: BuildAuthenticationRequest;
  buildAuthenticationRequestScope: () => string[];
  extractAuthorizationCode: ExtractAuthorizationCode;
  makeTokenRequest: MakeTokenRequest;
  validateIdToken: ValidateIdToken;
  makeUserInfoRequest: MakeUserInfoRequest;
  createFederationRequest: CreateFederationRequest;
  processFederationResponse: ProcessFederationResponse;

  /**
   * Creates a new FederationImpl instance.
   * Initializes all federation functions and sets up server metadata caching.
   *
   * @param config - The federation configuration containing client and server settings (must be OIDC protocol).
   * @param isDev - Whether running in development mode. Defaults to false.
   *                When true, allows insecure requests (e.g., HTTP instead of HTTPS).
   * @throws Error if the protocol is not 'oidc'.
   */
  constructor(config: FederationConfig, isDev: boolean = false) {
    if (config.protocol !== 'oidc') {
      throw new Error(
        `Unsupported protocol: ${config.protocol}. Only 'oidc' protocol is supported.`
      );
    }
    this.#config = config;

    this.fromFederationConfig = createFromFederationConfig(this.#config);
    this.issuer = () =>
      new URL(this.fromFederationConfig(['server', 'issuer']) as string);
    this.clientId = () =>
      this.fromFederationConfig(['client', 'clientId']) as string;
    this.clientSecret = () =>
      this.fromFederationConfig(['client', 'clientSecret']) as
        | string
        | undefined;
    this.redirectUri = () =>
      new URL(this.fromFederationConfig(['client', 'redirectUri']) as string);
    this.idTokenSignedResponseAlg = () =>
      this.fromFederationConfig(['client', 'idTokenSignedResponseAlg']) as
        | string
        | null
        | undefined;

    this.getServerMetadata = createGetServerMetadata(
      this.#serverMetadata,
      this.issuer,
      isDev,
      (metadata) => {
        this.#serverMetadata = metadata;
      }
    );
    this.fromServerMetadata = createFromServerMetadata(
      this.#serverMetadata,
      this.getServerMetadata,
      (metadata) => {
        this.#serverMetadata = metadata;
      }
    );

    this.authorizationEndpoint = async () =>
      new URL((await this.fromServerMetadata('authorization_endpoint', true))!);

    this.tokenEndpoint = async () =>
      new URL((await this.fromServerMetadata('token_endpoint', true))!);
    this.userInfoEndpoint = async () =>
      new URL((await this.fromServerMetadata('userinfo_endpoint', true))!);
    this.jwksUri = async () =>
      new URL((await this.fromServerMetadata('jwks_uri', true))!);
    this.authorizationResponseIssParameterSupported = async () =>
      (await this.fromServerMetadata(
        'authorization_response_iss_parameter_supported',
        false
      )) ?? false;

    this.buildAuthenticationRequestScope = createBuildAuthenticationRequestScope(
      this.fromFederationConfig
    );

    this.buildAuthenticationRequest = createBuildAuthenticationRequest(
      this.authorizationEndpoint,
      this.buildAuthenticationRequestScope,
      this.clientId,
      this.redirectUri
    );

    this.createFederationRequest = createCreateFederationRequest(
      this.buildAuthenticationRequest
    );

    this.extractAuthorizationCode = createExtractAuthorizationCode(
      this.getServerMetadata,
      this.clientId
    );

    this.makeTokenRequest = createMakeTokenRequest(
      this.getServerMetadata,
      this.clientId,
      this.clientSecret,
      this.redirectUri,
      isDev
    );

    this.validateIdToken = getValidatedIdTokenClaims;

    this.makeUserInfoRequest = createMakeUserInfoRequest(
      this.getServerMetadata,
      this.clientId,
      isDev
    );

    this.processFederationResponse = createProcessFederationResponse(
      this.extractAuthorizationCode,
      this.makeTokenRequest,
      this.validateIdToken,
      this.makeUserInfoRequest
    );
  }
}
