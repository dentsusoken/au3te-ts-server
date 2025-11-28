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
  FederationConfig,
  OidcClientConfig,
  OidcServerConfig,
} from '@vecrea/au3te-ts-common/schemas.federation';

/**
 * Type representing valid paths to access federation configuration values.
 * Can be:
 * - ['id'] for the federation ID
 * - ['client', key] for client configuration properties (OIDC only)
 * - ['server', key] for server configuration properties (OIDC only)
 */
export type KeyOfFederationConfig =
  | ['id']
  | ['client', keyof OidcClientConfig]
  | ['server', keyof OidcServerConfig];

/**
 * Extracts a value from federation configuration using a type-safe path.
 * @param path - The path to the configuration value (e.g., ['client', 'clientId']).
 * @returns The configuration value, or null/undefined if not found.
 */
export type FromFederationConfig = (
  path: KeyOfFederationConfig
) => string | string[] | null | undefined;

/**
 * Creates a FromFederationConfig function for accessing federation configuration values.
 * @param config - The federation configuration object (must be OIDC protocol).
 * @returns A function that extracts configuration values using type-safe paths.
 * @throws Error if the protocol is not 'oidc'.
 * @example
 * ```ts
 * const fromConfig = createFromFederationConfig(federationConfig);
 * const clientId = fromConfig(['client', 'clientId']);
 * const issuer = fromConfig(['server', 'issuer']);
 * ```
 */
export const createFromFederationConfig = (config: FederationConfig) => {
  if (config.protocol !== 'oidc') {
    throw new Error(
      `Unsupported protocol: ${config.protocol}. Only 'oidc' protocol is supported.`
    );
  }

  return (path: KeyOfFederationConfig): string | string[] | null | undefined => {
    switch (path[0]) {
      case 'id':
        return config.id;
      case 'client':
        return (config.client as OidcClientConfig)[path[1]];
      case 'server':
        return (config.server as OidcServerConfig)[path[1]];
      default:
        return null;
    }
  };
};
