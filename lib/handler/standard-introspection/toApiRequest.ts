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
import { ExtractClientCredentials, ExtractParameters } from '@/extractor';
import { ToApiRequest } from '../core/toApiRequest';
import { StandardIntrospectionRequest } from '@vecrea/au3te-ts-common/schemas.standard-introspection';
import { ResourceServerHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.resourceServer';

/**
 * Interface for creating a `ToApiRequest` function for Standard Introspection.
 *
 * @param {Object} params - The parameters for creating the function.
 * @param {ExtractClientCredentials} params.extractClientCredentials - Function to extract client credentials.
 * @param {ExtractParameters} params.extractParameters - Function to extract request parameters.
 * @param {ResourceServerHandlerConfiguration} params.resourceServerHandler - Configuration for handling resource servers.
 * @returns {ToApiRequest<StandardIntrospectionRequest>} The created `ToApiRequest` function.
 */
export interface CreateToApiRequest {
  (params: {
    extractClientCredentials: ExtractClientCredentials;
    extractParameters: ExtractParameters;
    resourceServerHandler: ResourceServerHandlerConfiguration;
  }): ToApiRequest<StandardIntrospectionRequest>;
}

/**
 * Creates a `ToApiRequest` function that converts an HTTP request into a `StandardIntrospectionRequest`.
 *
 * This function performs the following steps:
 * 1. Extracts client credentials from the request.
 * 2. Retrieves the resource server using the extracted client ID.
 * 3. Authenticates the resource server using the extracted client secret.
 * 4. Extracts request parameters and constructs the `StandardIntrospectionRequest` object.
 *
 * @param {Object} params - The parameters for creating the function.
 * @returns {ToApiRequest<StandardIntrospectionRequest>} The `ToApiRequest` function.
 */
export const createToApiRequest: CreateToApiRequest = ({
  extractClientCredentials,
  extractParameters,
  resourceServerHandler,
}) => {
  return async (request: Request) => {
    const { clientId: id, clientSecret: secret } =
      await extractClientCredentials(request);

    const rs = await resourceServerHandler.get(id!);

    if (!rs) {
      throw new Error('Resource server not found');
    }

    if (
      !(await resourceServerHandler.authenticate(
        rs.authenticationType,
        rs,
        secret!
      ))
    ) {
      throw new Error('Resource server authentication failed');
    }

    const parameters = await extractParameters(request);
    const accept = request.headers.get('Accept');

    return {
      parameters,
      httpAcceptHeader: accept,
      rsUri: rs.uri,
      introspectionSignAlg: rs.introspectionSignAlg,
      introspectionEncryptionAlg: rs.introspectionEncryptionAlg,
      introspectionEncryptionEnc: rs.introspectionEncryptionEnc,
      publicKeyForEncryption: rs.publicKeyForIntrospectionResponseEncryption,
      sharedKeyForSign: rs.sharedKeyForIntrospectionResponseSign,
      sharedKeyForEncryption: rs.sharedKeyForIntrospectionResponseEncryption,
    };
  };
};
