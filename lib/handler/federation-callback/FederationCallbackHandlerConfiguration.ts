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


/**
 * Configuration interface for the Federation Callback handler.
 * Handles OAuth callback responses from external identity providers.
 */
export interface FederationCallbackHandlerConfiguration {
  /**
   * The path for the federation callback endpoint.
   */
  path: string;

  /**
   * Processes a federation callback request.
   * Validates the callback, exchanges authorization code for tokens,
   * fetches user information, and updates the session with user data.
   * @param request - The HTTP request object containing the OAuth callback parameters.
   * @returns A promise that resolves to a response (typically an authorization page with user info).
   * @throws Error if federation parameters, authorization page model, or state are missing,
   *         or if federation processing fails.
   */
  processRequest: (request: Request) => Promise<Response>;
}
