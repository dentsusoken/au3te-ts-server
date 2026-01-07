/*
 * Copyright (C) 2018-2021 Authlete, Inc.
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
import { ExtractorConfiguration } from '@/extractor';
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
import {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
  clientRegistrationResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.client-registration';
import { SessionSchemas } from '@/session';
import {
  CreateProcessApiResponse,
  createProcessApiResponse,
} from './processApiResponse';
import { CreateToApiRequest, createToApiRequest } from './toApiRequest';
import { ClientRegistrationHandlerConfiguration } from './ClientRegistrationHandlerConfiguration';
import { ApiMethod, resolveApiPath } from './resolveApiPath';

export const CLIENT_REGISTRATION_PATH = '/connect/register/:clientId';

/**
 * Interface for overriding the default implementation factories.
 */
export interface ClientRegistrationHandlerConfigurationImplOverrides {
  createToApiRequest?: CreateToApiRequest;
  createProcessApiRequest?: typeof createProcessApiRequest<
    ClientRegistrationRequest,
    ClientRegistrationResponse
  >;
  createProcessApiResponse?: CreateProcessApiResponse;
  createHandle?: (
    params: CreateHandleParams<
      ClientRegistrationRequest,
      ClientRegistrationResponse
    >
  ) => Handle<ClientRegistrationRequest>;
  createProcessRequest?: (
    params: CreateProcessRequestParams<ClientRegistrationRequest>
  ) => ProcessRequest;
}

/**
 * Parameters for the constructor of `ClientRegistrationHandlerConfigurationImpl`.
 *
 * @template SS - The type of the session schemas.
 */
export interface ClientRegistrationHandlerConfigurationImplConstructorParams<
  SS extends SessionSchemas
> {
  /**
   * The API method to be used for the client registration request.
   */
  method: ApiMethod;

  /**
   * The server handler configuration.
   */
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;

  /**
   * The extractor configuration.
   */
  extractorConfiguration: ExtractorConfiguration;

  /**
   * Optional overrides for the handler implementation.
   */
  overrides?: ClientRegistrationHandlerConfigurationImplOverrides;
}

/**
 * Implementation of the `ClientRegistrationHandlerConfiguration` interface.
 * This class provides the concrete implementation for handling Client Registration requests,
 * including parameter extraction, API communication, and response processing.
 *
 * @template SS - The type of the session schemas.
 */
export class ClientRegistrationHandlerConfigurationImpl<
  SS extends SessionSchemas
> implements ClientRegistrationHandlerConfiguration
{
  /**
   * The path for the Client Registration endpoint.
   * Defaults to `CLIENT_REGISTRATION_PATH`.
   */
  path: string = CLIENT_REGISTRATION_PATH;

  /**
   * The function to process the API request to the Authlete API.
   */
  processApiRequest: ProcessApiRequest<
    ClientRegistrationRequest,
    ClientRegistrationResponse
  >;

  /**
   * The function to process the API response from the Authlete API.
   */
  processApiResponse: ProcessApiResponse<ClientRegistrationResponse>;

  /**
   * The function to handle the incoming request.
   */
  handle: Handle<ClientRegistrationRequest>;

  /**
   * The function to convert the incoming request to an API request object.
   */
  toApiRequest: ToApiRequest<ClientRegistrationRequest>;

  /**
   * The function to orchestrate the processing of the request.
   */
  processRequest: ProcessRequest;

  /**
   * Constructs a new `ClientRegistrationHandlerConfigurationImpl`.
   *
   * @param {ClientRegistrationHandlerConfigurationImplConstructorParams<SS>} params - The parameters for the constructor.
   */
  constructor({
    method,
    serverHandlerConfiguration,
    extractorConfiguration,
    overrides,
  }: ClientRegistrationHandlerConfigurationImplConstructorParams<SS>) {
    const {
      apiClient,
      responseFactory,
      responseErrorFactory,
      recoverResponseResult,
    } = serverHandlerConfiguration;

    this.toApiRequest = (overrides?.createToApiRequest ?? createToApiRequest)({
      path: this.path,
      extractParameters: extractorConfiguration.extractParameters,
      extractAccessToken: extractorConfiguration.extractAccessToken,
      extractPathParameter: extractorConfiguration.extractPathParameter,
    });

    this.processApiRequest = (
      overrides?.createProcessApiRequest ?? createProcessApiRequest
    )(
      resolveApiPath({
        method: method,
        basePath: apiClient.clientRegistrationPath,
      }),
      clientRegistrationResponseSchema,
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

    this.processRequest = (
      overrides?.createProcessRequest ?? createProcessRequest
    )({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
