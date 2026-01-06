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
} from '@vecrea/au3te-ts-common/schemas.standard-introspection';
import {
  Handle,
  ProcessApiRequest,
  ProcessApiResponse,
  ProcessRequest,
  ToApiRequest,
} from '../core';

/**
 * Interface for the Standard Introspection handler.
 * This handler processes OAuth 2.0 Token Introspection requests compliant with RFC 7662.
 */
export interface StandardIntrospectionHandlerConfiguration {
  /**
   * Processes the API request to Authlete.
   */
  processApiRequest: ProcessApiRequest<
    StandardIntrospectionRequest,
    StandardIntrospectionResponse
  >;

  /**
   * Processes the API response from Authlete.
   */
  processApiResponse: ProcessApiResponse<StandardIntrospectionResponse>;

  /**
   * Handles the introspection request.
   */
  handle: Handle<StandardIntrospectionRequest>;

  /**
   * Converts the HTTP request to an API request object.
   */
  toApiRequest: ToApiRequest<StandardIntrospectionRequest>;

  /**
   * Processes the incoming HTTP request.
   */
  processRequest: ProcessRequest;
}
