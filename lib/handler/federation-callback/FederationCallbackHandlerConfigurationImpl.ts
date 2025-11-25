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
import { FederationCallbackHandlerConfiguration } from './FederationCallbackHandlerConfiguration';
import { SessionSchemas } from '@/session/types';
import { createProcessRequest } from './processRequest';

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

    this.processRequest = createProcessRequest<SS>({
      path: this.path,
      extractPathParameter,
      federationManager,
      responseErrorFactory,
      session,
    });
  }
}
