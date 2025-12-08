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
  CredentialIssuerJwksRequest,
  CredentialIssuerJwksResponse,
  credentialIssuerJwksResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.credential-issuer-jwks';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { SessionSchemas } from '@/session/types';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { CredentialIssuerJwksHandlerConfiguration } from './CredentialIssuerJwksHandlerConfiguration';
import { ValidateApiResponse } from '../core/validateApiResponse';
import {
  createProcessApiRequestWithValidation,
  ProcessApiRequestWithValidation,
} from '../core/processApiRequestWithValidation';
import { createValidateApiResponse } from './validateApiResponse';
import { ToApiRequest } from '../core/toApiRequest';
import { ProcessRequest } from '../core/processRequest';
import { defaultToApiRequest } from './toApiRequest';
import { createProcessRequest } from '../core/processRequest';
import { defaultSessionSchemas } from '@/session/sessionSchemas';

/** The path for the credential issuer JWKS endpoint */
export const CREDENTIAL_ISSUER_JWKS_PATH = '/api/vci/jwks';

/**
 * Implementation of the CredentialIssuerJwksHandlerConfiguration interface.
 * This class configures the handling of credential issuer JWKS requests.
 */
export class CredentialIssuerJwksHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof defaultSessionSchemas
> implements CredentialIssuerJwksHandlerConfiguration
{
  /** The path for the credential issuer JWKS endpoint. */
  path: string = CREDENTIAL_ISSUER_JWKS_PATH;

  /** Function to process the API request for credential issuer JWKS. */
  processApiRequest: ProcessApiRequest<
    CredentialIssuerJwksRequest,
    CredentialIssuerJwksResponse
  >;

  /** Function to validate the API response for credential issuer JWKS. */
  validateApiResponse: ValidateApiResponse<CredentialIssuerJwksResponse>;

  /** Function to process the API request with validation. */
  processApiRequestWithValidation: ProcessApiRequestWithValidation<
    CredentialIssuerJwksRequest,
    CredentialIssuerJwksResponse
  >;

  /** Function to process the API response for credential issuer JWKS. */
  processApiResponse: ProcessApiResponse<CredentialIssuerJwksResponse>;

  /** Function to handle the credential issuer JWKS request. */
  handle: Handle<CredentialIssuerJwksRequest>;

  /** Function to convert HTTP requests to credential issuer JWKS API requests */
  toApiRequest: ToApiRequest<CredentialIssuerJwksRequest>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequest;

  /**
   * Creates an instance of CredentialIssuerJwksHandlerConfigurationImpl.
   */
  constructor(serverHandlerConfiguration: ServerHandlerConfiguration<SS>) {
    const {
      apiClient,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.credentialIssuerJwksPath,
      credentialIssuerJwksResponseSchema,
      apiClient
    );

    this.validateApiResponse = createValidateApiResponse({
      path: this.path,
      buildUnknownActionMessage:
        serverHandlerConfiguration.buildUnknownActionMessage,
      responseErrorFactory,
    });

    this.processApiRequestWithValidation =
      createProcessApiRequestWithValidation({
        processApiRequest: this.processApiRequest,
        validateApiResponse: this.validateApiResponse,
      });

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage:
        serverHandlerConfiguration.buildUnknownActionMessage,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = createHandle({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.toApiRequest = defaultToApiRequest;

    this.processRequest = createProcessRequest({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
