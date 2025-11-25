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
  PushedAuthReqRequest,
  PushedAuthReqResponse,
  pushedAuthReqResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.par';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { SessionSchemas } from '../../session/types';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { ParHandlerConfiguration } from './ParHandlerConfiguration';
import { ToApiRequest } from '../core/toApiRequest';
import { ProcessRequest } from '../core/processRequest';
import { ExtractorConfiguration } from '../../extractor/ExtractorConfiguration';
import { createToApiRequest } from '../core/toClientAuthRequest';
import { createProcessRequest } from '../core/processRequest';
import { defaultSessionSchemas } from '../../session/sessionSchemas';

/** The path for the PAR endpoint */
export const PAR_PATH = '/api/par';

/**
 * Implementation of the ParHandlerConfiguration interface.
 * This class configures and handles Pushed Authorization Requests (PAR).
 */
export class ParHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof defaultSessionSchemas
> implements ParHandlerConfiguration
{
  /** The path for the PAR endpoint. */
  path: string = PAR_PATH;

  /** Function to process the API request for PAR. */
  processApiRequest: ProcessApiRequest<
    PushedAuthReqRequest,
    PushedAuthReqResponse
  >;

  /** Function to process the API response for PAR. */
  processApiResponse: ProcessApiResponse<PushedAuthReqResponse>;

  /** Function to handle the PAR request. */
  handle: Handle<PushedAuthReqRequest>;

  /** Function to convert HTTP requests to PAR API requests */
  toApiRequest: ToApiRequest<PushedAuthReqRequest>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequest;

  /**
   * Creates an instance of ParHandlerConfigurationImpl.
   */
  constructor({
    serverHandlerConfiguration,
    extractorConfiguration,
  }: {
    serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
    extractorConfiguration: ExtractorConfiguration;
  }) {
    const {
      apiClient,
      buildUnknownActionMessage,
      recoverResponseResult,
      prepareHeaders,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.pushAuthorizationRequestPath,
      pushedAuthReqResponseSchema,
      apiClient
    );

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage,
      prepareHeaders,
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
