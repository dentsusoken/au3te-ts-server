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
import { ToApiRequest } from './toApiRequest';
import { Handle } from './handle';
import { RecoverResponseResult } from './recoverResponseResult';

/**
 * Represents a function that processes an HTTP request and returns a promise of a Response.
 * @param {Request} request - The HTTP request to be processed.
 * @returns {Promise<Response>} A promise that resolves to the HTTP response.
 */
export type ProcessRequest = (request: Request) => Promise<Response>;

/**
 * Parameters for creating a process request function.
 * @template REQ - The type of the API request object.
 * @property {string} path - The API endpoint path.
 * @property {ToApiRequest<REQ>} toApiRequest - Function to convert HTTP requests to API requests.
 * @property {Handle<REQ>} handle - Function to handle the API request.
 * @property {RecoverResponseResult} recoverResponseResult - Function to recover from response errors.
 */
export type CreateProcessRequestParams<REQ extends object> = {
  path: string;
  toApiRequest: ToApiRequest<REQ>;
  handle: Handle<REQ>;
  recoverResponseResult: RecoverResponseResult;
};

/**
 * Creates a function to process an HTTP request.
 * @template REQ - The type of the API request object.
 * @param {CreateProcessRequestParams<REQ>} params - Parameters for creating the process request function.
 * @returns {ProcessRequest} A function that processes the HTTP request.
 */
export const createProcessRequest =
  <REQ extends object>({
    path,
    toApiRequest,
    handle,
    recoverResponseResult,
  }: CreateProcessRequestParams<REQ>): ProcessRequest =>
  async (request) => {
    const responseResult = await runAsyncCatching(async () => {
      const apiRequest = await toApiRequest(request);

      return handle(apiRequest);
    });

    return await recoverResponseResult(path, responseResult);
  };
