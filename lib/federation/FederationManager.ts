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
import { FederationsConfig } from '@vecrea/au3te-ts-common/schemas.federation';
import { Federation } from './Federation';

/**
 * Interface for managing multiple federation configurations.
 * Provides methods to validate configurations, build federation instances, and retrieve them by ID.
 * 
 * @example
 * ```ts
 * const manager: FederationManager = new FederationManagerImpl({ federations: [...] });
 * const federation = manager.getFederation('google');
 * const isValid = manager.isConfigurationValid(0);
 * ```
 */
export interface FederationManager {
  /**
   * Checks if the federation configuration at the given index is valid.
   * @param index - The zero-based index of the configuration in the federations array.
   * @returns true if the configuration exists and is valid, false otherwise.
   */
  isConfigurationValid(index: number): boolean;
  
  /**
   * Builds a map of Federation instances from the configurations.
   * Only valid configurations are included in the result.
   * @returns A map where keys are federation IDs and values are Federation instances.
   */
  buildFederations(): Map<string, Federation>;
  
  /**
   * Gets the federations configurations.
   * @returns The federations configuration object containing all federation settings.
   */
  getConfigurations(): FederationsConfig;
  
  /**
   * Gets a Federation instance by its ID.
   * @param id - The unique identifier of the federation configuration.
   * @returns The Federation instance for the given ID.
   * @throws Error if no federation with the given ID exists.
   */
  getFederation(id: string): Federation;
}
