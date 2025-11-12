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
import { runAsyncCatching } from '@vecrea/oid4vc-core/utils';
import { ProcessApiRequest } from './processApiRequest';
import { ProcessApiResponse } from './processApiResponse';
import { RecoverResponseResult } from './recoverResponseResult';
import { ApiRequestWithOptions, ApiResponseWithOptions } from './types';

/**
 * Represents a function that handles API requests with options.
 * @template REQ - The type of the API request object.
 * @template OPTS - The type of the options object.
 * @param {ApiRequestWithOptions<REQ, OPTS>} apiRequestWithOptions - The API request with options.
 * @returns {Promise<Response>} A promise that resolves to the API response.
 */
export type HandleWithOptions<REQ extends object, OPTS = unknown> = (
  apiRequestWithOptions: ApiRequestWithOptions<REQ, OPTS>
) => Promise<Response>;

/**
 * Parameters for creating a handle with options function.
 * @template REQ - The type of the API request object.
 * @template RES - The type of the API response object.
 * @template OPTS - The type of the options object.
 */
export type CreateHandleWithOptionsParams<REQ extends object, RES, OPTS = unknown> = {
  /** The API endpoint path */
  path: string;

  /** Function to process the API request */
  processApiRequest: ProcessApiRequest<REQ, RES>;

  /** Function to process the API response */
  processApiResponse: ProcessApiResponse<ApiResponseWithOptions<RES, OPTS>, OPTS>;

  /** Function to recover from response errors */
  recoverResponseResult: RecoverResponseResult;
};

/**
 * Creates a function that handles API requests with options.
 * @template REQ - The type of the API request object.
 * @template RES - The type of the API response object.
 * @template OPTS - The type of the options object.
 * @param {CreateHandleWithOptionsParams<REQ, RES, OPTS>} params - The parameters for creating the handle function.
 * @returns {HandleWithOptions<REQ, OPTS>} A function that handles API requests with options.
 */
export const createHandleWithOptions =
  <REQ extends object, RES, OPTS = unknown>({
    path,
    processApiRequest,
    processApiResponse,
    recoverResponseResult,
  }: CreateHandleWithOptionsParams<REQ, RES, OPTS>): HandleWithOptions<
    REQ,
    OPTS
  > =>
  async ({ apiRequest, options }) => {
    const responseResult = await runAsyncCatching(async () => {
      const apiResponse = await processApiRequest(apiRequest);

      return processApiResponse({ apiResponse, options });
    });

    return await recoverResponseResult(path, responseResult);
  };
