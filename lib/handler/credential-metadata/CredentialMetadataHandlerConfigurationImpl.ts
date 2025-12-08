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
  CredentialIssuerMetadataRequest,
  CredentialIssuerMetadataResponse,
  credentialIssuerMetadataResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.credential-metadata';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { SessionSchemas } from '@/session/types';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { CredentialMetadataHandlerConfiguration } from './CredentialMetadataHandlerConfiguration';
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

/** The path for the credential metadata endpoint */
export const CREDENTIAL_METADATA_PATH = '/.well-known/openid-credential-issuer';

/**
 * Implementation of the CredentialMetadataHandlerConfiguration interface.
 * This class configures the handling of credential metadata requests.
 */
export class CredentialMetadataHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof defaultSessionSchemas
> implements CredentialMetadataHandlerConfiguration
{
  /** The path for the credential metadata endpoint. */
  path: string = CREDENTIAL_METADATA_PATH;

  /** Function to process the API request for credential metadata. */
  processApiRequest: ProcessApiRequest<
    CredentialIssuerMetadataRequest,
    CredentialIssuerMetadataResponse
  >;

  /** Function to validate the API response for credential metadata. */
  validateApiResponse: ValidateApiResponse<CredentialIssuerMetadataResponse>;

  /** Function to process the API request with validation. */
  processApiRequestWithValidation: ProcessApiRequestWithValidation<
    CredentialIssuerMetadataRequest,
    CredentialIssuerMetadataResponse
  >;

  /** Function to process the API response for credential metadata. */
  processApiResponse: ProcessApiResponse<CredentialIssuerMetadataResponse>;

  /** Function to handle the credential metadata request. */
  handle: Handle<CredentialIssuerMetadataRequest>;

  /** Function to convert HTTP requests to credential metadata API requests */
  toApiRequest: ToApiRequest<CredentialIssuerMetadataRequest>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequest;

  /**
   * Creates an instance of CredentialMetadataHandlerConfigurationImpl.
   */
  constructor(serverHandlerConfiguration: ServerHandlerConfiguration<SS>) {
    const {
      apiClient,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.credentialIssuerMetadataPath,
      credentialIssuerMetadataResponseSchema,
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
