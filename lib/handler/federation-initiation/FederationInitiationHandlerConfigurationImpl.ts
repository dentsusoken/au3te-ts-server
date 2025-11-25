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

import { SessionSchemas } from '../../session/types';
import { ServerHandlerConfiguration } from '../core';
import { FederationManager } from '@/federation';
import { ExtractorConfiguration } from '@/extractor';
import { generateRandomState, generateRandomCodeVerifier } from 'oauth4webapi';
import { FederationInitiationHandlerConfiguration } from './FederationInitiationHandlerConfiguration';
export type FederationInitiationHandlerConfigurationImplConstructorParams<
  SS extends SessionSchemas
> = {
  /** Server handler configuration */
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  /** Extractor configuration */
  extractorConfiguration: ExtractorConfiguration;
  federationManager: FederationManager;
};

export const FEDERATION_INITIATION_PATH = '/api/federation/initiation/:federationId';

/**
 * Implementation of FederationInitiationHandlerConfiguration.
 * Handles requests to initiate federation authentication flows with external identity providers.
 * @template SS - The type of session schemas in use.
 */
export class FederationInitiationHandlerConfigurationImpl<
  SS extends SessionSchemas
> implements FederationInitiationHandlerConfiguration {
  /**
   * The path for the federation initiation endpoint.
   */
  path: string = FEDERATION_INITIATION_PATH;

  processRequest: (request: Request) => Promise<Response>;

  constructor({
    serverHandlerConfiguration,
    extractorConfiguration,
    federationManager,
  }: FederationInitiationHandlerConfigurationImplConstructorParams<SS>) {
    const { responseFactory, responseErrorFactory, session } =
      serverHandlerConfiguration;

    const { extractPathParameter } = extractorConfiguration;

    this.processRequest = async (request: Request) => {
      const { federationId } = extractPathParameter(request, this.path);
      
      let federation;
      try {
        federation = federationManager.getFederation(federationId);
      } catch (error) {
        return responseErrorFactory.notFoundResponseError(
          `Federation with ID '${federationId}' not found`
        ).response;
      }

      const state = generateRandomState();
      const codeVerifier = generateRandomCodeVerifier();

      await session.set('federationParams', {
        state: state,
        codeVerifier: codeVerifier,
      });

      const authenticationRequest = await federation.createFederationRequest(
        state,
        codeVerifier
      );


      return responseFactory.location(authenticationRequest.toString());
    };
  }
}
