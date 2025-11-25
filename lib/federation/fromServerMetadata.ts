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
import { AuthorizationServer } from 'oauth4webapi';
import { GetServerMetadata } from './getServerMetadata';

/**
 * Extracts a value from authorization server metadata.
 * @template T - The metadata field name (authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri, or authorization_response_iss_parameter_supported).
 * @param path - The metadata field name to extract.
 * @param required - If true, throws an error if the field is missing. If false, returns undefined for missing fields.
 * @returns A promise that resolves to the metadata value, or undefined if not required and missing.
 * @throws Error if required is true and the field is not found in server metadata.
 */
export type FromServerMetadata = <
  T extends keyof Pick<
    AuthorizationServer,
    | 'authorization_endpoint'
    | 'token_endpoint'
    | 'userinfo_endpoint'
    | 'jwks_uri'
    | 'authorization_response_iss_parameter_supported'
  >
>(
  path: T,
  required: boolean
) => Promise<AuthorizationServer[T]>;

/**
 * Creates a FromServerMetadata function for accessing authorization server metadata.
 * @param serverMetadata - Optional cached server metadata. If not provided, will be fetched on first access.
 * @param getServerMetadata - Function to retrieve server metadata if not cached.
 * @param setServerMetadata - Optional callback to update cached metadata when fetched.
 * @returns A function that extracts metadata values with caching support.
 * @example
 * ```ts
 * const fromMetadata = createFromServerMetadata(undefined, getMetadata, setMetadata);
 * const authEndpoint = await fromMetadata('authorization_endpoint', true);
 * ```
 */
export const createFromServerMetadata = (
  serverMetadata: AuthorizationServer | undefined,
  getServerMetadata: GetServerMetadata,
  setServerMetadata?: (metadata: AuthorizationServer) => void
): FromServerMetadata => {
  return async <
    T extends keyof Pick<
      AuthorizationServer,
      | 'authorization_endpoint'
      | 'token_endpoint'
      | 'userinfo_endpoint'
      | 'jwks_uri'
      | 'authorization_response_iss_parameter_supported'
    >,
    U extends boolean
  >(
    path: T,
    required: U
  ) => {
    if (!serverMetadata) {
      serverMetadata = await getServerMetadata();
      if (setServerMetadata) {
        setServerMetadata(serverMetadata);
      }
    }

    const value = serverMetadata[path];

    if (!value && required) {
      throw new Error(`'${path}' is not found in server metadata`);
    }

    return value;
  };
};
