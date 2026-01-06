/*
 * Copyright (C) 2017-2023 Authlete, Inc.
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
  StandardIntrospectionRequest,
  StandardIntrospectionResponse,
  standardIntrospectionResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.standard-introspection';
import {
  createHandle,
  CreateHandleParams,
  createProcessApiRequest,
  createProcessRequest,
  CreateProcessRequestParams,
  Handle,
  ProcessApiRequest,
  ProcessApiResponse,
  ProcessRequest,
  ServerHandlerConfiguration,
  ToApiRequest,
} from '../core';
import { StandardIntrospectionHandlerConfiguration } from './StandardIntrospectionHandlerConfiguration';
import { SessionSchemas } from '@/session';
import { createToApiRequest, CreateToApiRequest } from './toApiRequest';
import { ExtractorConfiguration } from '@/extractor';
import { ResourceServerHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.resourceServer';
import {
  createProcessApiResponse,
  CreateProcessApiResponse,
} from './processApiResponse';

/**
 * The path for the Standard Introspection endpoint.
 */
export const STANDARD_INTROSPECTION_PATH = '/api/introspect';

/**
 * Overrides for {@link StandardIntrospectionImpl}.
 *
 * @property {CreateToApiRequest} createToApiRequest - Factory to create `toApiRequest`.
 * @property {CreateProcessApiRequest} createProcessApiRequest - Factory to create `processApiRequest`.
 * @property {CreateProcessApiResponse} createProcessApiResponse - Factory to create `processApiResponse`.
 * @property {CreateHandle<StandardIntrospectionRequest, StandardIntrospectionResponse>} createHandle - Factory to create `handle`.
 * @property {CreateProcessRequest} createProcessRequest - Factory to create `processRequest`.
 */
export interface StandardIntrospectionHandlerConfigurationImplOverrides {
  createToApiRequest?: CreateToApiRequest;
  createProcessRequest?: (params: CreateProcessRequestParams<StandardIntrospectionRequest>) => ProcessRequest;
  createHandle?: (params: CreateHandleParams<StandardIntrospectionRequest, StandardIntrospectionResponse>) => Handle<StandardIntrospectionRequest>;
  createProcessApiResponse?: CreateProcessApiResponse;
  createProcessApiRequest?: typeof createProcessApiRequest<StandardIntrospectionRequest, StandardIntrospectionResponse>;
}

/**
 * Constructor parameters for {@link StandardIntrospectionImpl}.
 *
 * @template SS - The type of session schemas.
 * @property {ServerHandlerConfiguration<SS>} serverHandlerConfiguration - Configuration for the server handler.
 * @property {ExtractorConfiguration} extractorConfiguration - Configuration for extracting request parameters.
 * @property {ResourceServerHandlerConfiguration} resourceServerHandlerConfiguration - Configuration for the resource server handler.
 * @property {StandardIntrospectionHandlerConfigurationImplOverrides} [overrides] - Overrides for internal factories.
 */
export interface StandardIntrospectionImplConstructorParams<
  SS extends SessionSchemas
> {
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  extractorConfiguration: ExtractorConfiguration;
  resourceServerHandlerConfiguration: ResourceServerHandlerConfiguration;
  overrides?: StandardIntrospectionHandlerConfigurationImplOverrides;
}

/**
 * Implementation of the {@link StandardIntrospectionHandlerConfiguration} interface.
 * Handles the logic for processing standard introspection requests.
 *
 * @template SS - The type of session schemas.
 */
export class StandardIntrospectionHandlerConfigurationImpl<
  SS extends SessionSchemas
> implements StandardIntrospectionHandlerConfiguration
{
  readonly path = STANDARD_INTROSPECTION_PATH;

  processApiRequest: ProcessApiRequest<
    StandardIntrospectionRequest,
    StandardIntrospectionResponse
  >;
  processApiResponse: ProcessApiResponse<StandardIntrospectionResponse>;
  handle: Handle<StandardIntrospectionRequest>;
  toApiRequest: ToApiRequest<StandardIntrospectionRequest>;
  processRequest: ProcessRequest;

  constructor({
    serverHandlerConfiguration,
    extractorConfiguration,
    resourceServerHandlerConfiguration,
    overrides,
  }: StandardIntrospectionImplConstructorParams<SS>) {
    const {
      apiClient,
      responseFactory,
      responseErrorFactory,
      recoverResponseResult,
    } = serverHandlerConfiguration;

    this.toApiRequest = (overrides?.createToApiRequest ?? createToApiRequest)({
      extractClientCredentials: extractorConfiguration.extractClientCredentials,
      extractParameters: extractorConfiguration.extractParameters,
      resourceServerHandler: resourceServerHandlerConfiguration,
    });

    this.processApiRequest = (overrides?.createProcessApiRequest ?? createProcessApiRequest)(
        apiClient.standardIntrospectionPath,
        standardIntrospectionResponseSchema,
        apiClient
    );

    this.processApiResponse = (
      overrides?.createProcessApiResponse ?? createProcessApiResponse
    )({
      path: this.path,
      buildUnknownActionMessage:
        serverHandlerConfiguration.buildUnknownActionMessage,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = (overrides?.createHandle ?? createHandle)({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.processRequest = (overrides?.createProcessRequest ?? createProcessRequest)({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
