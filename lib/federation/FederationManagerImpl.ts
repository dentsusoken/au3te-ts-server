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
  FederationRegistry,
  FederationConfig,
  federationConfigSchema,
} from '@vecrea/au3te-ts-common/schemas.federation';
import { FederationManager } from './FederationManager';
import { Federation } from './Federation';
import { OidcFederationImpl } from './oidc/OidcFederationImpl';
import { Saml2FederationImpl } from './saml2/Saml2FederationImpl';
import { SamlifyValidator } from './saml2/Saml2ConfigurationImpl';

/**
 * Parameters for constructing a FederationManagerImpl instance.
 */
export type FederationManagerImplConstructorParams = {
  /** Federations configuration containing an array of federation configurations. */
  registry: FederationRegistry;
  /** Whether running in development mode. Defaults to false. */
  isDev?: boolean;

  validator?: SamlifyValidator;
};

/**
 * Implementation of FederationManager interface.
 * Manages multiple federation configurations and provides access to Federation instances.
 */
export class FederationManagerImpl implements FederationManager {
  #registry: FederationRegistry;
  #federations: Map<string, Federation>;
  #isDev: boolean;
  #validator;

  constructor({
    registry,
    isDev = false,
    validator,
  }: FederationManagerImplConstructorParams) {
    this.#registry = registry;
    this.#isDev = isDev;
    this.#validator = validator;
    this.#federations = this.buildFederations();
  }

  /**
   * Checks if the configuration at the given index is valid.
   * @param index - The index of the configuration to validate
   * @returns true if the configuration is valid, false otherwise
   */
  isConfigurationValid(index: number): boolean {
    if (!this.#registry || !this.#registry.federations) {
      return false;
    }
    if (index < 0 || index >= this.#registry.federations.length) {
      return false;
    }
    const config = this.#registry.federations[index];
    return this.isFederationConfigValid(config);
  }

  /**
   * Builds a map of Federation instances from the configurations.
   * @returns A map of federation ID to Federation instance
   */
  buildFederations(): Map<string, Federation> {
    const federations = new Map<string, Federation>();

    if (!this.#registry || !this.#registry.federations) {
      return federations;
    }

    for (const config of this.#registry.federations) {
      if (this.isFederationConfigValid(config)) {
        let federation;
        if (config.protocol === 'oidc') {
          federation = new OidcFederationImpl(config, this.#isDev);
        } else if (config.protocol === 'saml2' && this.#validator) {
          federation = new Saml2FederationImpl(config, this.#validator);
        } else {
          continue;
        }
        federations.set(config.id, federation);
      }
    }

    return federations;
  }

  /**
   * Gets the federations configurations.
   * @returns The federations registry
   */
  getConfigurations(): FederationRegistry {
    return this.#registry;
  }

  /**
   * Gets a Federation instance by its ID.
   * @param id - The federation ID
   * @returns The Federation instance
   * @throws Error if the federation is not found
   */
  getFederation(id: string): Federation {
    const federation = this.#federations.get(id);
    if (!federation) {
      throw new Error(`Federation with ID '${id}' not found`);
    }
    return federation;
  }

  /**
   * Validates a single FederationConfig.
   * Only OIDC protocol configurations are considered valid.
   * @param config - The federation configuration to validate
   * @returns true if the configuration is valid (OIDC protocol), false otherwise
   */
  private isFederationConfigValid(
    config: FederationConfig
  ): config is FederationConfig {
    const { success } = federationConfigSchema.safeParse(config);
    return success;
  }
}
