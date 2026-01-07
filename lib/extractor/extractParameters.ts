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
  isJsonType,
  isFormUrlEncodedType,
} from '@vecrea/au3te-ts-common/utils';

/**
 * Represents a function that extracts parameters from a Request object.
 *
 * @typedef {Function} ExtractParameters
 * @async
 *
 * @param {Request} request - The Request object from which to extract parameters.
 *
 * @returns {Promise<string>} A promise that resolves to a string representation of the extracted parameters.
 *
 * @description
 * This type defines a function that takes a Request object and returns a Promise resolving to a string.
 * The string typically represents the extracted parameters in a format such as URL-encoded or JSON.
 *
 * Implementations of this type should handle various scenarios, including:
 * - Different HTTP methods (GET, POST, etc.)
 * - Various content types (application/json, application/x-www-form-urlencoded, etc.)
 * - Extraction from request body and/or URL query parameters
 * };
 */
export type ExtractParameters = (request: Request) => Promise<string>;

/**
 * Extracts parameters from a Request object based on its method and content type.
 *
 * @function defaultExtractParameters
 * @type {ExtractParameters}
 * @async
 *
 * @param {Request} request - The Request object from which to extract parameters.
 *
 * @returns {Promise<string>} A promise that resolves to a string representation of the extracted parameters.
 *
 * @description
 * This function handles parameter extraction differently based on the HTTP method and content type:
 *
 * 1. For POST requests:
 *    - If the content type is JSON, it parses the request body as JSON and returns it as a stringified JSON.
 *    - If the content type is form-urlencoded, it parses the request body and returns it as a URL-encoded string.
 *
 * 2. For PUT requests:
 *    - If the content type is JSON, it parses the request body as JSON and returns it as a stringified JSON.
 *
 * 3. For all other requests (including GET):
 *    - It extracts parameters from the URL query string and returns them as a URL-encoded string.
 *
 * 4. If the content type is not supported or not specified for POST requests, it falls back to extracting
 *    parameters from the URL query string.
 *
 * @example
 * // For a POST request with JSON content
 * const jsonRequest = new Request('https://example.com', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' })
 * });
 * const jsonResult = await defaultExtractParameters(jsonRequest);
 * // jsonResult will be '{"key":"value"}'
 *
 * @example
 * // For a GET request with query parameters
 * const getRequest = new Request('https://example.com?key=value&foo=bar');
 * const getResult = await defaultExtractParameters(getRequest);
 * // getResult will be 'key=value&foo=bar'
 *
 * @example
 * // For a PUT request with JSON content
 * const putRequest = new Request('https://example.com', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ key: 'value' })
 * });
 * const putResult = await defaultExtractParameters(putRequest);
 * // putResult will be '{"key":"value"}'
 */
export const defaultExtractParameters: ExtractParameters = async (request) => {
  const contentType = request.headers.get('Content-Type') || undefined;

  if (request.method.toUpperCase() === 'POST') {
    if (isJsonType(contentType)) {
      return JSON.stringify(await request.json());
    } else if (isFormUrlEncodedType(contentType)) {
      const params = new URLSearchParams(await request.text());

      return params.toString();
    }
  }

  if (request.method.toUpperCase() === 'PUT') {
    if (isJsonType(contentType)) {
      return JSON.stringify(await request.json());
    }
  }

  const params = new URLSearchParams(new URL(request.url).search);

  return params.toString();
};
