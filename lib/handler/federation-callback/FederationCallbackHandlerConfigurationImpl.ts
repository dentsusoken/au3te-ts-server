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
import {
  createProcessRequest,
  CreateProcessRequestParams,
  ProcessRequest,
} from './processRequest';
import { DefaultSessionSchemas } from '@/session';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

export type FederationCallbackHandlerConfigurationImplOverrides<
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  createProcessRequest: (
    params: CreateProcessRequestParams<SS, U, T>
  ) => ProcessRequest;
};

export type FederationCallbackHandlerConfigurationImplConstructorParams<
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
> = {
  /** Server handler configuration */
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  /** Extractor configuration */
  extractorConfiguration: ExtractorConfiguration;
  /** Federation manager */
  federationManager: FederationManager;
  /** User handler */
  userHandler: UserHandlerConfiguration<U, T>;
  /** Overrides for extending handler behaviour */
  overrides?: FederationCallbackHandlerConfigurationImplOverrides<SS, U, T>;
};

export const FEDERATION_CALLBACK_PATH =
  '/api/federation/callback/:federationId';

/**
 * Implementation of FederationCallbackHandlerConfiguration.
 * Handles OAuth callback responses from external identity providers during federation flows.
 * @template SS - The type of session schemas in use.
 */
export class FederationCallbackHandlerConfigurationImpl<
  SS extends DefaultSessionSchemas,
  U extends User,
  T extends keyof Omit<U, 'loginId' | 'password'> = never
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
    userHandler,
    overrides,
  }: FederationCallbackHandlerConfigurationImplConstructorParams<SS, U, T>) {
    const { responseErrorFactory, session } = serverHandlerConfiguration;
    const { extractPathParameter } = extractorConfiguration;

    const resolvedOverrides =
      overrides ??
      ({} as FederationCallbackHandlerConfigurationImplOverrides<SS, U, T>);

    this.processRequest = (
      resolvedOverrides.createProcessRequest ?? createProcessRequest<SS, U>
    )({
      path: this.path,
      extractPathParameter,
      federationManager,
      responseErrorFactory,
      session,
      userHandler,
    });
  }
}
