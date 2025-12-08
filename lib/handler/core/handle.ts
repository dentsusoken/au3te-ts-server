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

/**
 * Represents a function that handles an API request and returns a Promise of Response.
 * @template REQ - The type of the request object, must extend object
 * @template OPTS - The type of optional parameters
 * @param {REQ} apiRequest - The API request to be processed
 * @param {OPTS} [options] - Optional parameters
 * @returns {Promise<Response>} A Promise that resolves to a Response object
 */
export type Handle<REQ extends object, OPTS = unknown> = (
  apiRequest: REQ,
  options?: OPTS
) => Promise<Response>;

/**
 * Parameters for creating a handle function.
 * @template REQ - The type of the request object, must extend object.
 * @template RES - The type of the API response.
 * @template OPTS - The type of optional parameters.
 */
export type CreateHandleParams<REQ extends object, RES, OPTS = unknown> = {
  /** The API endpoint path */
  path: string;
  /** Function to process the API request */
  processApiRequest: ProcessApiRequest<REQ, RES>;
  /** Function to process the API response */
  processApiResponse: ProcessApiResponse<RES, OPTS>;
  /** Function to recover from response errors */
  recoverResponseResult: RecoverResponseResult;
};

/**
 * Creates a handle function for processing API requests and responses.
 * @template REQ - The type of the request object, must extend object.
 * @template RES - The type of the API response.
 * @template OPTS - The type of optional parameters.
 * @param {CreateHandleParams<REQ, RES, OPTS>} params - The parameters for creating the handle function.
 * @returns {Handle<REQ, OPTS>} A function that handles API requests and returns a Promise of Response.
 */
export const createHandle =
  <REQ extends object, RES, OPTS = unknown>({
    path,
    processApiRequest,
    processApiResponse,
    recoverResponseResult,
  }: CreateHandleParams<REQ, RES, OPTS>): Handle<REQ, OPTS> =>
  async (apiRequest, options) => {
    const responseResult = await runAsyncCatching(async () => {
      const apiResponse = await processApiRequest(apiRequest);

      return processApiResponse(apiResponse, options);
    });

    return await recoverResponseResult(path, responseResult);
  };
