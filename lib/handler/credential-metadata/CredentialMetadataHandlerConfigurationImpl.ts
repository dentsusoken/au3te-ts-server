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
import { ProcessApiRequest } from '../processApiRequest';
import { ProcessApiResponse } from '../processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../handle';
import { SessionSchemas } from '@/session/types';
import { createProcessApiRequest } from '../processApiRequest';
import { ServerHandlerConfiguration } from '../ServerHandlerConfiguration';
import { CredentialMetadataHandlerConfiguration } from './CredentialMetadataHandlerConfiguration';
import { ValidateApiResponse } from '../validateApiResponse';
import {
  createProcessApiRequestWithValidation,
  ProcessApiRequestWithValidation,
} from '../processApiRequestWithValidation';
import { createValidateApiResponse } from './validateApiResponse';
import { ToApiRequest } from '../toApiRequest';
import { ProcessRequest } from '../processRequest';
import { defaultToApiRequest } from './toApiRequest';
import { createProcessRequest } from '../processRequest';
import { sessionSchemas } from '@/session/sessionSchemas';

/** The path for the credential metadata endpoint */
export const CREDENTIAL_METADATA_PATH = '/.well-known/openid-credential-issuer';

/**
 * Implementation of the CredentialMetadataHandlerConfiguration interface.
 * This class configures the handling of credential metadata requests.
 */
export class CredentialMetadataHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof sessionSchemas
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
    const { apiClient, recoverResponseResult } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.credentialIssuerMetadataPath,
      credentialIssuerMetadataResponseSchema,
      apiClient
    );

    this.validateApiResponse = createValidateApiResponse({
      path: this.path,
      buildUnknownActionMessage:
        serverHandlerConfiguration.buildUnknownActionMessage,
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
