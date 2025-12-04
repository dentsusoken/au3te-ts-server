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
import {
  AuthorizationServer,
  discoveryRequest,
  allowInsecureRequests,
  processDiscoveryResponse,
  DiscoveryRequestOptions,
} from 'oauth4webapi';

/**
 * Retrieves authorization server metadata using OIDC discovery.
 * @param options - Optional discovery request options (e.g., signal for abort).
 * @returns A promise that resolves to the authorization server metadata.
 */
export type GetServerMetadata = (options?: DiscoveryRequestOptions) => Promise<AuthorizationServer>;

/**
 * Creates a GetServerMetadata function with caching support.
 * @param serverMetadata - Optional cached server metadata. If provided, returns immediately without discovery.
 * @param issuer - Function that returns the issuer URL for discovery.
 * @param isDev - Whether running in development mode (allows insecure requests).
 * @param setServerMetadata - Optional callback to update cached metadata when fetched.
 * @returns A function that retrieves server metadata, using cache if available.
 * @example
 * ```ts
 * const getMetadata = createGetServerMetadata(
 *   undefined,
 *   () => new URL('https://auth.example.com'),
 *   false,
 *   (metadata) => { cachedMetadata = metadata; }
 * );
 * const metadata = await getMetadata();
 * ```
 */
export const createGetServerMetadata =
  (
    serverMetadata: AuthorizationServer | undefined,
    issuer: () => URL,
    isDev: boolean,
    setServerMetadata?: (metadata: AuthorizationServer) => void
  ): GetServerMetadata =>
  async (options?: DiscoveryRequestOptions): Promise<AuthorizationServer> => {
    if (serverMetadata) {
      return serverMetadata;
    }
    const url = issuer();
    const res = await discoveryRequest(url, {
      ...options,
      [allowInsecureRequests]: isDev,
    });
    const metadata = await processDiscoveryResponse(url, res);
    
    if (setServerMetadata) {
      setServerMetadata(metadata);
    }
    
    return metadata;
  };

export type CreateGetServerMetadata = typeof createGetServerMetadata;
