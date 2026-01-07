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
import {
  Handle,
  ProcessApiRequest,
  ProcessApiResponse,
  ProcessRequest,
  ToApiRequest,
} from '../core';
import {
  ClientRegistrationRequest,
  ClientRegistrationResponse,
} from '@vecrea/au3te-ts-common/schemas.client-registration';

/**
 * Configuration interface for the Client Registration handler.
 * This interface defines the essential components and the path required
 * to handle Client Registration requests.
 */
export interface ClientRegistrationHandlerConfiguration {
  /**
   * The path for the Client Registration endpoint.
   */
  path: string;

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
}
