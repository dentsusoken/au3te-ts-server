/*
 * Copyright (C) 2024 Dentsusoken, Inc.
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

import { ExtractorConfiguration } from '../../extractor/ExtractorConfiguration';
import { ServerCredentialHandlerConfiguration } from '../credential/ServerCredentialHandlerConfiguration';
import { IntrospectionHandlerConfiguration } from '../introspection/IntrospectionHandlerConfiguration';
import { ServerHandlerConfiguration } from '../core/ServerHandlerConfiguration';
import { SessionSchemas } from '../../session';
import { defaultSessionSchemas } from '../../session/sessionSchemas';
import { createToApiRequest } from './toApiRequest';
import { CredentialSingleParseHandlerConfiguration } from '../credential-single-parse/CredentialSingleParseHandlerConfiguration';
import { CommonCredentialHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.credential';
import { createProcessApiRequest } from '../core/processApiRequest';
import { credentialSingleIssueResponseSchema } from '@vecrea/au3te-ts-common/schemas.credential-single-issue';
import { createProcessApiResponse } from './processApiResponse';
import { createHandleWithOptions } from '../core/handleWithOptions';
import { createProcessRequestWithOptions } from '../core/processRequestWithOptions';

type CreateCredentialSingleIssueHandlerConfigurationImplParams<
  SS extends SessionSchemas
> = {
  extractorConfiguration: ExtractorConfiguration;
  serverCredentialHandlerConfiguration: ServerCredentialHandlerConfiguration;
  introspectionHandlerConfiguration: IntrospectionHandlerConfiguration;
  serverHandlerConfiguration: ServerHandlerConfiguration<SS>;
  credentialSingleParseHandlerConfiguration: CredentialSingleParseHandlerConfiguration;
  commonCredentialHandlerConfiguration: CommonCredentialHandlerConfiguration;
};

/**
 * The path for the credential single issue endpoint.
 */
export const CREDENTIAL_SINGLE_ISSUE_PATH = '/api/credential';

/**
 * Implementation of the Credential Single Issue Handler Configuration.
 *
 * @class CredentialSingleIssueHandlerConfigurationImpl
 * @implements {CredentialSingleIssueHandlerConfiguration}
 */
export class CredentialSingleIssueHandlerConfigurationImpl<
  SS extends SessionSchemas = typeof defaultSessionSchemas
> {
  readonly path = CREDENTIAL_SINGLE_ISSUE_PATH;

  readonly toApiRequest;

  readonly processApiRequest;

  readonly processApiResponse;

  readonly handle;

  readonly processRequest;

  constructor({
    extractorConfiguration,
    serverCredentialHandlerConfiguration,
    introspectionHandlerConfiguration,
    serverHandlerConfiguration,
    credentialSingleParseHandlerConfiguration,
    commonCredentialHandlerConfiguration,
  }: CreateCredentialSingleIssueHandlerConfigurationImplParams<SS>) {
    const {
      buildUnknownActionMessage,
      recoverResponseResult,
      prepareHeaders,
      responseFactory,
      responseErrorFactory,
    } = serverHandlerConfiguration;
    const {
      extractAccessToken,
      extractClientCertificateAndPath,
      extractParameters,
    } = extractorConfiguration;
    const { computeHtu } = serverCredentialHandlerConfiguration;
    this.toApiRequest = createToApiRequest({
      extractAccessToken,
      extractClientCertificateAndPath,
      extractParameters,
      responseErrorFactory,
      computeHtu,
      introspect:
        introspectionHandlerConfiguration.processApiRequestWithValidation,
      prepareHeaders,
      parseSingleCredential:
        credentialSingleParseHandlerConfiguration.processApiRequestWithValidation,
      getToOrder: commonCredentialHandlerConfiguration.getToOrder,
    });

    this.processApiRequest = createProcessApiRequest(
      serverHandlerConfiguration.apiClient.credentialSingleIssuePath,
      credentialSingleIssueResponseSchema,
      serverHandlerConfiguration.apiClient
    );

    this.processApiResponse = createProcessApiResponse({
      path: this.path,
      buildUnknownActionMessage,
      responseFactory,
      responseErrorFactory,
    });

    this.handle = createHandleWithOptions({
      path: this.path,
      processApiRequest: this.processApiRequest,
      processApiResponse: this.processApiResponse,
      recoverResponseResult,
    });

    this.processRequest = createProcessRequestWithOptions({
      path: this.path,
      toApiRequest: this.toApiRequest,
      handle: this.handle,
      recoverResponseResult,
    });
  }
}
