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
import { FromServerMetadata } from './fromServerMetadata';
import { FromFederationConfig } from './fromFederationConfig';
import { GetServerMetadata } from './getServerMetadata';
import { BuildAuthenticationRequest } from './buildAuthenticationRequest';
import { ExtractAuthorizationCode } from './extractAuthorizationCode';
import { MakeTokenRequest } from './makeTokenRequest';
import { ValidateIdToken } from './validateIdToken';
import { MakeUserInfoRequest } from './makeUserInfoRequest';
import { CreateFederationRequest } from './createFederationRequest';
import { ProcessFederationResponse } from './processFederationResponse';

/**
 * Interface representing a federation configuration and its operations.
 * Provides methods to interact with an external identity provider for OAuth2/OIDC federation.
 *
 * @example
 * ```ts
 * const federation: Federation = new FederationImpl(config, false);
 * const authUrl = await federation.createFederationRequest('state-123', 'verifier');
 * const userInfo = await federation.processFederationResponse(callbackUrl, 'state-123', 'verifier');
 * ```
 */
export interface OidcFederation {
  /** The ID of the federation. */
  readonly id: string;
  /** The type of the federation. */
  readonly type: 'oidc';
  /** The function to extract values from federation configuration using type-safe paths. */
  /** Function to extract values from federation configuration using type-safe paths. */
  fromFederationConfig: FromFederationConfig;

  /** Returns the issuer URL of the external identity provider. */
  issuer: () => URL;

  /** Returns the client ID registered with the external identity provider. */
  clientId: () => string;

  /** Returns the client secret (if applicable) for client authentication. */
  clientSecret: () => string | undefined;

  /** Returns the redirect URI registered with the external identity provider. */
  redirectUri: () => URL;

  /** Returns the ID token signed response algorithm preference. */
  idTokenSignedResponseAlg: () => string | undefined | null;

  /** Function to retrieve authorization server metadata via OIDC discovery. */
  getServerMetadata: GetServerMetadata;

  /** Function to extract values from authorization server metadata. */
  fromServerMetadata: FromServerMetadata;

  /** Returns the authorization endpoint URL of the external identity provider. */
  authorizationEndpoint: () => Promise<URL>;

  /** Returns the token endpoint URL of the external identity provider. */
  tokenEndpoint: () => Promise<URL>;

  /** Returns the UserInfo endpoint URL of the external identity provider. */
  userInfoEndpoint: () => Promise<URL>;

  /** Returns the JWKS URI for verifying ID tokens from the external identity provider. */
  jwksUri: () => Promise<URL>;

  /** Returns whether the external identity provider supports the 'iss' parameter in authorization responses. */
  authorizationResponseIssParameterSupported: () => Promise<boolean>;

  /** Function to build OAuth2/OIDC authentication request URLs with PKCE support. */
  buildAuthenticationRequest: BuildAuthenticationRequest;

  /** Returns the scope array to be used in authentication requests. */
  buildAuthenticationRequestScope: () => string[];

  /** Function to extract and validate authorization codes from OAuth callbacks. */
  extractAuthorizationCode: ExtractAuthorizationCode;

  /** Function to exchange authorization codes for access and ID tokens. */
  makeTokenRequest: MakeTokenRequest;

  /** Function to validate ID tokens and extract claims. */
  validateIdToken: ValidateIdToken;

  /** Function to fetch user information from the UserInfo endpoint. */
  makeUserInfoRequest: MakeUserInfoRequest;

  /** Function to create federation authentication request URLs with state and PKCE. */
  createFederationRequest: CreateFederationRequest;

  /** Function to process the complete federation authentication flow and retrieve user information. */
  processFederationResponse: ProcessFederationResponse;
}
