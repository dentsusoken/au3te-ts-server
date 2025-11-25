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
  ServiceConfigurationRequest,
  ServiceConfigurationResponse,
  serviceConfigurationResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.service-configuration';
import {
  createProcessGetApiRequest,
  ProcessApiRequest,
} from '../core/processApiRequest';
import { ProcessApiResponse } from '../core/processApiResponse';
import { createProcessApiResponse } from './processApiResponse';
import { Handle, createHandle } from '../core/handle';
import { SessionSchemas } from '../../session/types';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { ServiceConfigurationHandlerConfiguration } from './ServiceConfigurationHandlerConfiguration';
import { ToApiRequest } from '../core/toApiRequest';
import { ProcessRequest } from '../core/processRequest';
import { defaultToApiRequest } from './toApiRequest';
import { createProcessRequest } from '../core/processRequest';
import { defaultSessionSchemas } from '../../session/sessionSchemas';

/** The path for the service configuration endpoint */
export const SERVICE_CONFIGURATION_PATH = '/.well-known/openid-configuration';

/**
 * Implementation of the ServiceConfigurationHandlerConfiguration interface.
 * This class configures the handling of service configuration requests.
 */
export class ServiceConfigurationHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof defaultSessionSchemas
> implements ServiceConfigurationHandlerConfiguration
{
  /** The path for the service configuration endpoint. */
  path: string = SERVICE_CONFIGURATION_PATH;

  /** Function to process the API request for service configuration. */
  processApiRequest: ProcessApiRequest<
    ServiceConfigurationRequest,
    ServiceConfigurationResponse
  >;

  /** Function to process the API response for service configuration. */
  processApiResponse: ProcessApiResponse<ServiceConfigurationResponse>;

  /** Function to handle the service configuration request. */
  handle: Handle<ServiceConfigurationRequest>;

  /** Function to convert HTTP requests to service configuration API requests */
  toApiRequest: ToApiRequest<ServiceConfigurationRequest>;

  /** Function to process incoming HTTP requests */
  processRequest: ProcessRequest;

  /**
   * Creates an instance of ServiceConfigurationHandlerConfigurationImpl.
   */
  constructor(serverHandlerConfiguration: ServerHandlerConfiguration<SS>) {
    const { apiClient, recoverResponseResult, responseFactory } =
      serverHandlerConfiguration;

    this.processApiRequest = createProcessGetApiRequest(
      apiClient.serviceConfigurationPath,
      serviceConfigurationResponseSchema,
      apiClient
    );

    this.processApiResponse = createProcessApiResponse({
      responseFactory,
    });

    this.handle = createHandle({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.toApiRequest = defaultToApiRequest;

    this.processRequest = createProcessRequest({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
