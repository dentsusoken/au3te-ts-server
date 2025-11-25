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
  ClientConfig,
  FederationConfig,
  ServerConfig,
} from '@vecrea/au3te-ts-common/schemas.federation';

/**
 * Type representing valid paths to access federation configuration values.
 * Can be:
 * - ['id'] for the federation ID
 * - ['client', key] for client configuration properties
 * - ['server', key] for server configuration properties
 */
export type KeyOfFederationConfig =
  | ['id']
  | ['client', keyof ClientConfig]
  | ['server', keyof ServerConfig];

/**
 * Extracts a value from federation configuration using a type-safe path.
 * @param path - The path to the configuration value (e.g., ['client', 'clientId']).
 * @returns The configuration value, or null/undefined if not found.
 */
export type FromFederationConfig = (
  path: KeyOfFederationConfig
) => string | null | undefined;

/**
 * Creates a FromFederationConfig function for accessing federation configuration values.
 * @param config - The federation configuration object.
 * @returns A function that extracts configuration values using type-safe paths.
 * @example
 * ```ts
 * const fromConfig = createFromFederationConfig(federationConfig);
 * const clientId = fromConfig(['client', 'clientId']);
 * const issuer = fromConfig(['server', 'issuer']);
 * ```
 */
export const createFromFederationConfig = (config: FederationConfig) => {
  return (path: KeyOfFederationConfig): string | null | undefined => {
    switch (path[0]) {
      case 'id':
        return config.id;
      case 'client':
        return config.client[path[1]];
      case 'server':
        return config.server[path[1]];
      default:
        return null;
    }
  };
};
