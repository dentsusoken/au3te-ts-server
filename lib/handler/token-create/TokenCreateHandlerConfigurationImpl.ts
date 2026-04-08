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

import type { DefaultSessionSchemas } from '../../session/sessionSchemas';
import {
  TokenCreateRequest,
  TokenCreateResponse,
  tokenCreateResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.token-create';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { TokenCreateHandlerConfiguration } from './TokenCreateHandlerConfiguration';

/** The path for the token create endpoint */
export const TOKEN_CREATE_PATH = '/api/token/create';

/**
 * Implementation of the TokenCreateHandlerConfiguration interface.
 * This class configures and handles Token Create requests.
 */
export class TokenCreateHandlerConfigurationImpl
  implements TokenCreateHandlerConfiguration
{
  /** The path for the token create endpoint. */
  path: string = TOKEN_CREATE_PATH;

  /** Function to process the API request for token creation. */
  processApiRequest: ProcessApiRequest<TokenCreateRequest, TokenCreateResponse>;

  /** Function to process the API response for token creation. */
  processApiResponse: ProcessApiResponse<TokenCreateResponse>;

  /** Function to handle the token creation request. */
  handle: Handle<TokenCreateRequest>;

  /**
   * Creates an instance of TokenCreateHandlerConfigurationImpl.
   * @param {ServerHandlerConfiguration<DefaultSessionSchemas>} serverHandlerConfiguration - The server handler configuration.
   */
  constructor(
    serverHandlerConfiguration: ServerHandlerConfiguration<DefaultSessionSchemas>
  ) {
    const {
      apiClient,
      buildUnknownActionMessage,
      recoverResponseResult,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;

    this.processApiRequest = createProcessApiRequest(
      apiClient.tokenCreatePath,
      tokenCreateResponseSchema,
      apiClient
    );

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = createHandle({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });
  }
}
