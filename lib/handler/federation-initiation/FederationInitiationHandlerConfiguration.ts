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
 * Configuration interface for the Federation Initiation handler.
 * Handles requests to initiate federation authentication flows.
 */
export interface FederationInitiationHandlerConfiguration {
  /**
   * The path for the federation initiation endpoint.
   */
  path: string;

  /**
   * Processes a federation initiation request.
   * Extracts the federation ID from the path, generates state and code verifier,
   * stores them in session, and redirects to the external identity provider.
   * @param request - The HTTP request object.
   * @returns A promise that resolves to a redirect response to the external identity provider.
   */
  processRequest: (request: Request) => Promise<Response>;
}
