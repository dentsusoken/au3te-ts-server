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
import { ServerHandlerConfiguration } from '../core';
import { FederationManager } from '@/federation';
import { ExtractorConfiguration } from '@/extractor';
import { simpleBuildResponse } from '../authorization';
import { User } from '@vecrea/au3te-ts-common/schemas.common';
import { FederationCallbackHandlerConfiguration } from './FederationCallbackHandlerConfiguration';
import { SessionSchemas } from '@/session/types';


export type FederationCallbackHandlerConfigurationImplConstructorParams<
  SS extends SessionSchemas
> = {
  /** Server handler configuration */
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  /** Extractor configuration */
  extractorConfiguration: ExtractorConfiguration;
  federationManager: FederationManager;
};

export const FEDERATION_CALLBACK_PATH =
  '/api/federation/callback/:federationId';

/**
 * Implementation of FederationCallbackHandlerConfiguration.
 * Handles OAuth callback responses from external identity providers during federation flows.
 * @template SS - The type of session schemas in use.
 */
export class FederationCallbackHandlerConfigurationImpl<
  SS extends SessionSchemas
> implements FederationCallbackHandlerConfiguration
{
  /**
   * The path for the federation callback endpoint.
   */
  path: string = FEDERATION_CALLBACK_PATH;

  processRequest: (request: Request) => Promise<Response>;

  constructor({
    serverHandlerConfiguration,
    extractorConfiguration,
    federationManager,
  }: FederationCallbackHandlerConfigurationImplConstructorParams<SS>) {
    const { responseErrorFactory, session } = serverHandlerConfiguration;
    const { extractPathParameter } = extractorConfiguration;

    this.processRequest = async (request: Request) => {
      try {
        const { federationId } = extractPathParameter(request, this.path);
        
        let federation: ReturnType<typeof federationManager.getFederation>;
        try {
          federation = federationManager.getFederation(federationId);
        } catch (error) {
          return responseErrorFactory.notFoundResponseError(
            `Federation with ID '${federationId}' not found`
          ).response;
        }

        const federationParams = await session.get('federationParams');
        if (!federationParams) {
          return responseErrorFactory.badRequestResponseError(
            'Federation parameters not found'
          ).response;
        }

        const model = await session.get('authorizationPageModel');
        if (!model) {
          return responseErrorFactory.badRequestResponseError(
            'Authorization page model not found'
          ).response;
        }

        const { state, codeVerifier } = federationParams;

        if (!state) {
          return responseErrorFactory.badRequestResponseError('State not found')
            .response;
        }

        let userinfo;
        try {
          userinfo = await federation.processFederationResponse(
            new URL(request.url),
            state,
            codeVerifier
          );
        } catch (error) {
          return responseErrorFactory.badRequestResponseError(
            `Failed to process federation response: ${error instanceof Error ? error.message : 'Unknown error'}`
          ).response;
        }

        const user: User = {
          ...userinfo,
          subject: `${userinfo.sub}@${federationId}`,
        };

        const authTime = Math.floor(Date.now() / 1000);

        await session.setBatch({
          user,
          authTime,
        });

        model.user = user;

        return simpleBuildResponse(model);
      } catch (error) {
        return responseErrorFactory.internalServerErrorResponseError(
          `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
        ).response;
      }
    };
  }
}
