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
  TokenFailRequest,
  TokenFailResponse,
  tokenFailResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.token-fail';
import { ProcessApiRequest } from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { createProcessApiRequest } from '../core/processApiRequest';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { TokenFailHandlerConfiguration } from './TokenFailHandlerConfiguration';
import { Headers } from '../core/responseFactory';
import {
  BuildTokenFailError,
  createBuildTokenFailError,
} from './buildTokenFailError';

/** The path for the token fail endpoint */
export const TOKEN_FAIL_PATH = '/api/token/fail';
/**
 * Implementation of the TokenFailHandlerConfiguration interface.
 * This class configures and handles Token Fail requests.
 */
export class TokenFailHandlerConfigurationImpl
  implements TokenFailHandlerConfiguration
{
  /** The path for the token fail endpoint. */
  path: string = TOKEN_FAIL_PATH;

  /** Function to process the API request for token fail. */
  processApiRequest: ProcessApiRequest<TokenFailRequest, TokenFailResponse>;

  /** Function to process the API response for token fail. */
  processApiResponse: ProcessApiResponse<TokenFailResponse, Headers>;

  /** Function to handle the token fail request. */
  handle: Handle<TokenFailRequest, Headers>;

  /** Function to build a token fail error. */
  buildTokenFailError: BuildTokenFailError;

  /**
   * Creates an instance of TokenFailHandlerConfigurationImpl.
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
      apiClient.tokenFailPath,
      tokenFailResponseSchema,
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

    this.buildTokenFailError = createBuildTokenFailError(this.handle);
  }
}
