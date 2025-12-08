/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Extracts path parameters from a request URL based on a pattern.
 * @param request - The HTTP request object.
 * @param pattern - The path pattern with parameter placeholders (e.g., '/api/users/:userId').
 * @returns A record mapping parameter names to their values from the URL path.
 */
export type ExtractPathParameter = (
  request: Request,
  pattern: string
) => Record<string, string>;

/**
 * Default implementation of ExtractPathParameter.
 * Extracts path parameters by matching URL path segments with pattern segments that start with ':'.
 * @param request - The HTTP request object.
 * @param pattern - The path pattern with parameter placeholders (e.g., '/api/users/:userId').
 * @returns A record mapping parameter names to their values from the URL path.
 * @example
 * ```ts
 * const request = new Request('https://example.com/api/users/123');
 * const params = defaultExtractPathParameter(request, '/api/users/:userId');
 * // params = { userId: '123' }
 * ```
 */
export const defaultExtractPathParameter: ExtractPathParameter = (
  request: Request,
  pattern: string
) => {
  const path = new URL(request.url).pathname;

  const pathParts = path.split('/');
  const patternParts = pattern.split('/');

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart;
    }
  }

  return params;
};
