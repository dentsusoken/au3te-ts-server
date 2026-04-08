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

import { CredentialSingleIssueRequest } from '@vecrea/au3te-ts-common/schemas.credential-single-issue';
import { ExtractAccessToken } from '../../extractor/extractAccessToken';
import { ToApiRequest } from '../core/toApiRequest';
import { ComputeHtu } from '../credential/computeHtu';
import { ExtractClientCertificateAndPath } from '../../extractor/extractClientCertificateAndPath';
import {
  IntrospectionRequest,
  IntrospectionResponse,
} from '@vecrea/au3te-ts-common/schemas.introspection';
import { BadRequestError } from '@vecrea/au3te-ts-common/handler';
import { ProcessApiRequestWithValidation } from '../core/processApiRequestWithValidation';
import { PrepareHeaders } from '../core/prepareHeaders';
import { CREDENTIAL_ENDPOINT, DEFERRED, DPOP, POST } from '../constants';
import { INVALID_CREDENTIAL_SINGLE_ISSUE_REQUEST } from './errorCode';
import { ExtractParameters } from '../../extractor/extractParameters';
import {
  CredentialSingleParseRequest,
  CredentialSingleParseResponse,
} from '@vecrea/au3te-ts-common/schemas.credential-single-parse';
import { CredentialRequestInfo } from '@vecrea/au3te-ts-common/schemas.credential';
import { GetToOrder } from '@vecrea/au3te-ts-common/handler.credential';
import { runAsyncCatching } from '@vecrea/oid4vc-core/utils';
import { CredentialApiOptions } from '../credential/types';
import { ApiRequestWithOptions } from '../core/types';
import { ResponseErrorFactory } from '../core/responseErrorFactory';

/**
 * Parameters required to create a credential single issue API request converter.
 *
 * @interface CreateToApiRequestParams
 * @property {ExtractAccessToken} extractAccessToken - Function to extract access token
 */
type CreateToApiRequestParams = {
  extractAccessToken: ExtractAccessToken;
  extractClientCertificateAndPath: ExtractClientCertificateAndPath;
  extractParameters: ExtractParameters;
  computeHtu: ComputeHtu;
  introspect: ProcessApiRequestWithValidation<
    IntrospectionRequest,
    IntrospectionResponse
  >;
  prepareHeaders: PrepareHeaders;
  parseSingleCredential: ProcessApiRequestWithValidation<
    CredentialSingleParseRequest,
    CredentialSingleParseResponse,
    CredentialApiOptions
  >;
  getToOrder: GetToOrder;
  responseErrorFactory: ResponseErrorFactory;
};

/**
 * Creates a function that converts an HTTP request to a Credential Single Issue API request.
 *
 * @function createToApiRequest
 * @param {CreateToApiRequestParams} params - The parameter extraction function
 * @returns {ToApiRequest<CredentialSingleIssueRequest>} A function that converts Request to CredentialSingleIssueRequest
 */
export const createToApiRequest =
  ({
    extractAccessToken,
    extractClientCertificateAndPath,
    extractParameters,
    computeHtu,
    introspect,
    prepareHeaders,
    parseSingleCredential,
    getToOrder,
    responseErrorFactory,
  }: CreateToApiRequestParams): ToApiRequest<
    ApiRequestWithOptions<CredentialSingleIssueRequest, CredentialApiOptions>
  > =>
  async (request: Request) => {
    const accessToken = extractAccessToken(request);

    if (!accessToken) {
      throw new BadRequestError(
        INVALID_CREDENTIAL_SINGLE_ISSUE_REQUEST,
        'Access token is required'
      );
    }

    const { clientCertificate } = await extractClientCertificateAndPath(
      request
    );
    const requestContent = await extractParameters(request);
    const dpop = request.headers.get(DPOP) ?? undefined;
    const htu = await computeHtu(dpop, CREDENTIAL_ENDPOINT);

    const introspectionRequest: IntrospectionRequest = {
      token: accessToken,
      clientCertificate,
      dpop,
      htm: POST,
      htu,
    };
    const introspectionResponse = await introspect(introspectionRequest);
    const headers = prepareHeaders({
      dpopNonce: introspectionResponse.dpopNonce,
    });
    const options: CredentialApiOptions = {
      accessToken,
      headers,
    };
    const credentialSingleParseRequest: CredentialSingleParseRequest = {
      accessToken,
      requestContent,
    };
    const credentialSingleParseResponse = await parseSingleCredential(
      credentialSingleParseRequest,
      options
    );
    const credentialRequestInfo =
      credentialSingleParseResponse.info as CredentialRequestInfo | null | undefined;

    if (!credentialRequestInfo) {
      throw new BadRequestError(
        INVALID_CREDENTIAL_SINGLE_ISSUE_REQUEST,
        'Credential request info is missing in the parse response'
      );
    }

    const toOrder = getToOrder(credentialRequestInfo.format);
    const orderResult = await runAsyncCatching(async () =>
      toOrder({
        credentialType: 'single',
        credentialRequestInfo,
        introspectionResponse,
      })
    );
    orderResult.onFailure((error) => {
      if (error instanceof BadRequestError) {
        throw responseErrorFactory.badRequestResponseError(
          error.message,
          headers
        );
      }
      throw error;
    });
    const order = orderResult.value!;
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const issuanceDeferred = searchParams.get(DEFERRED);

    if (issuanceDeferred) {
      order.issuanceDeferred = Boolean(issuanceDeferred);
    }

    const apiRequest: CredentialSingleIssueRequest = {
      accessToken,
      order: orderResult.value!,
    };

    return { apiRequest, options };
  };
