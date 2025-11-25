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

import { ApiClientImpl } from '../api/ApiClientImpl';
import { AuthleteConfiguration } from '@vecrea/au3te-ts-common/conf';
import { sessionSchemas } from '../session/sessionSchemas';
import { InMemorySession } from '../session/InMemorySession';
import { ServerHandlerConfigurationImpl } from '../handler/core/ServerHandlerConfigurationImpl';
import { ExtractorConfigurationImpl } from '../extractor/ExtractorConfigurationImpl';
import { ParHandlerConfigurationImpl } from '../handler/par/ParHandlerConfigurationImpl';
import { ServiceConfigurationHandlerConfigurationImpl } from '../handler/service-configuration/ServiceConfigurationHandlerConfigurationImpl';
import { CredentialMetadataHandlerConfigurationImpl } from '../handler/credential-metadata/CredentialMetadataHandlerConfigurationImpl';
import { AuthorizationHandlerConfigurationImpl } from '../handler/authorization/AuthorizationHandlerConfigurationImpl';
import { AuthorizationIssueHandlerConfigurationImpl } from '../handler/authorization-issue/AuthorizationIssueHandlerConfigurationImpl';
import { AuthorizationFailHandlerConfigurationImpl } from '../handler/authorization-fail/AuthorizationFailHandlerConfigurationImpl';
import { AuthorizationPageHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { AuthorizationDecisionHandlerConfigurationImpl } from '../handler/authorization-decision/AuthorizationDecisionHandlerConfigurationImpl';
import { UserHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.user';
import { TokenHandlerConfigurationImpl } from '../handler/token/TokenHandlerConfigurationImpl';
import { TokenCreateHandlerConfigurationImpl } from '../handler/token-create/TokenCreateHandlerConfigurationImpl';
import { TokenFailHandlerConfigurationImpl } from '../handler/token-fail/TokenFailHandlerConfigurationImpl';
import { TokenIssueHandlerConfigurationImpl } from '../handler/token-issue/TokenIssueHandlerConfigurationImpl';
import { IntrospectionHandlerConfigurationImpl } from '../handler/introspection/IntrospectionHandlerConfigurationImpl';
import { CredentialSingleParseHandlerConfigurationImpl } from '../handler/credential-single-parse/CredentialSingleParseHandlerConfigurationImpl';
import { CommonCredentialHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.credential';
import { ServerCredentialHandlerConfigurationImpl } from '../handler/credential/ServerCredentialHandlerConfigurationImpl';
import { CredentialSingleIssueHandlerConfigurationImpl } from '../handler/credential-single-issue/CredentialSingleIssueHandlerConfigurationImpl';
import { ServiceJwksHandlerConfigurationImpl } from '../handler/service-jwks/ServiceJwksHandlerConfigurationImpl';
import { CredentialIssuerJwksHandlerConfigurationImpl } from '../handler/credential-issuer-jwks/CredentialIssuerJwksHandlerConfigurationImpl';
import { FederationManager } from '@/federation/FederationManager';
import { vi } from 'vitest';

export const configuration: AuthleteConfiguration = {
  apiVersion: process.env.API_VERSION!,
  baseUrl: process.env.API_BASE_URL!,
  serviceApiKey: process.env.API_KEY!,
  serviceAccessToken: process.env.ACCESS_TOKEN!,
};

export const apiClient = new ApiClientImpl(configuration);
export const session = new InMemorySession(sessionSchemas);
export const serverHandlerConfiguration = new ServerHandlerConfigurationImpl(
  apiClient,
  session
);
export const extractorConfiguration = new ExtractorConfigurationImpl();
export const parHandlerConfiguration = new ParHandlerConfigurationImpl({
  serverHandlerConfiguration,
  extractorConfiguration,
});

const federationManager = {
  getConfigurations: vi.fn(),
} as unknown as FederationManager;
export const authorizationIssueHandlerConfiguration =
  new AuthorizationIssueHandlerConfigurationImpl(serverHandlerConfiguration);
export const authorizationFailHandlerConfiguration =
  new AuthorizationFailHandlerConfigurationImpl(serverHandlerConfiguration);
export const authorizationPageHandlerConfiguration =
  new AuthorizationPageHandlerConfigurationImpl();
export const authorizationHandlerConfiguration =
  new AuthorizationHandlerConfigurationImpl({
    serverHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
    authorizationPageHandlerConfiguration,
    extractorConfiguration,
    federationManager,
  });
export const userHandlerConfiguration = new UserHandlerConfigurationImpl();
export const authorizationDecisionHandlerConfiguration =
  new AuthorizationDecisionHandlerConfigurationImpl({
    serverHandlerConfiguration,
    extractorConfiguration,
    userHandlerConfiguration,
    authorizationHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
  });
export const tokenCreateHandlerConfiguration =
  new TokenCreateHandlerConfigurationImpl(serverHandlerConfiguration);
export const tokenFailHandlerConfiguration =
  new TokenFailHandlerConfigurationImpl(serverHandlerConfiguration);
export const tokenIssueHandlerConfiguration =
  new TokenIssueHandlerConfigurationImpl(serverHandlerConfiguration);
export const tokenHandlerConfiguration = new TokenHandlerConfigurationImpl({
  serverHandlerConfiguration,
  userHandlerConfiguration,
  tokenFailHandlerConfiguration,
  tokenIssueHandlerConfiguration,
  tokenCreateHandlerConfiguration,
  extractorConfiguration,
});
export const introspectionHandlerConfiguration =
  new IntrospectionHandlerConfigurationImpl(serverHandlerConfiguration);
export const serviceConfigurationHandlerConfiguration =
  new ServiceConfigurationHandlerConfigurationImpl(serverHandlerConfiguration);
export const credentialMetadataHandlerConfiguration =
  new CredentialMetadataHandlerConfigurationImpl(serverHandlerConfiguration);
export const credentialSingleParseHandlerConfiguration =
  new CredentialSingleParseHandlerConfigurationImpl(serverHandlerConfiguration);
export const commonCredentialHandlerConfiguration =
  new CommonCredentialHandlerConfigurationImpl({
    userHandlerConfiguration,
  });
export const serverCredentialHandlerConfiguration =
  new ServerCredentialHandlerConfigurationImpl({
    credentialMetadataHandlerConfiguration,
  });
export const credentialSingleIssueHandlerConfiguration =
  new CredentialSingleIssueHandlerConfigurationImpl({
    extractorConfiguration,
    serverCredentialHandlerConfiguration,
    introspectionHandlerConfiguration,
    serverHandlerConfiguration,
    credentialSingleParseHandlerConfiguration,
    commonCredentialHandlerConfiguration,
  });
export const serviceJwksHandlerConfiguration =
  new ServiceJwksHandlerConfigurationImpl(serverHandlerConfiguration);
export const credentialIssuerJwksHandlerConfiguration =
  new CredentialIssuerJwksHandlerConfigurationImpl(serverHandlerConfiguration);
