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

/**
 * The base path for the pushed authentication request API.
 *
 * This constant represents the path template for the pushed authentication request API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant
 * @type {string}
 * @example
 * // Usage example:
 * const serviceId = '1234';
 * const path = PUSHED_AUTH_REQ_API_PATH.replace('%d', serviceId);
 * // Result: '/api/1234/pushed_auth_req'
 */
const PUSHED_AUTH_REQ_API_PATH = '/api/%d/pushed_auth_req';

/**
 * Path template for Authlete's authorization API endpoint.
 *
 * This constant represents the path template for the authorization API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 */
const AUTH_AUTHORIZATION_API_PATH = '/api/%d/auth/authorization';

/**
 * The path template for the authorization issue API endpoint.
 *
 * This constant represents the URL path for issuing an authorization.
 * The '%d' placeholder should be replaced with the appropriate service API key or version number.
 *
 * @constant
 * @type {string}
 * @example
 * // Usage example:
 * const serviceApiKey = '1234';
 * const path = AUTH_AUTHORIZATION_ISSUE_API_PATH.replace('%d', serviceApiKey);
 * // Result: '/api/1234/auth/authorization/issue'
 */
const AUTH_AUTHORIZATION_ISSUE_API_PATH = '/api/%d/auth/authorization/issue';

/**
 * Path template for Authlete's authorization failure API endpoint.
 *
 * This constant represents the path template for the authorization failure API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 * @see {@link https://docs.authlete.com/#auth-authorization-fail|Authlete API Reference: /auth/authorization/fail}
 */
const AUTH_AUTHORIZATION_FAIL_API_PATH = '/api/%d/auth/authorization/fail';

/**
 * Path template for Authlete's token API endpoint.
 *
 * This constant represents the path template for the token API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 */
const AUTH_TOKEN_API_PATH = '/api/%d/auth/token';

/**
 * Path template for Authlete's token issue API endpoint.
 *
 * This constant represents the path template for the token issue API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 * @example
 * // Usage example:
 * const serviceApiKey = '1234';
 * const path = AUTH_TOKEN_ISSUE_API_PATH.replace('%d', serviceApiKey);
 * // Result: '/api/1234/auth/token/issue'
 */
const AUTH_TOKEN_ISSUE_API_PATH = '/api/%d/auth/token/issue';

/**
 * Path template for Authlete's token failure API endpoint.
 *
 * This constant represents the path template for the token failure API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 * @see {@link https://docs.authlete.com/#auth-token-fail|Authlete API Reference: /auth/token/fail}
 */
const AUTH_TOKEN_FAIL_API_PATH = '/api/%d/auth/token/fail';

/**
 * Path template for Authlete's token create API endpoint.
 *
 * This constant represents the path template for the token create API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 */
const AUTH_TOKEN_CREATE_API_PATH = '/api/%d/auth/token/create';

/**
 * Path template for Authlete's introspection API endpoint.
 *
 * This constant represents the path template for the introspection API endpoint.
 * The '%d' placeholder should be replaced with the appropriate API version number
 * when constructing the full URL.
 *
 * @constant {string}
 */
const AUTH_INTROSPECTION_API_PATH = '/api/%d/auth/introspection';
/**
 * The path template for the service configuration API endpoint.
 *
 * This constant represents the URL path for getting service configuration.
 * The '%d' placeholder should be replaced with the appropriate service API key or version number.
 *
 * @constant
 * @type {string}
 * @example
 * // Usage example:
 * const serviceApiKey = '1234';
 * const path = SERVICE_CONFIGURATION_API_PATH.replace('%d', serviceApiKey);
 * // Result: '/api/1234/service/configuration'
 */
const SERVICE_CONFIGURATION_API_PATH = '/api/%d/service/configuration';

/**
 * The path template for the credential issuer metadata API endpoint.
 *
 * This constant represents the URL path for getting credential issuer metadata.
 * The '%d' placeholder should be replaced with the appropriate service API key or version number.
 *
 * @constant
 * @type {string}
 * @example
 * // Usage example:
 * const serviceApiKey = '1234';
 * const path = CREDENTIAL_ISSUER_METADATA_API_PATH.replace('%d', serviceApiKey);
 * // Result: '/api/1234/vci/metadata'
 */
const CREDENTIAL_ISSUER_METADATA_API_PATH = '/api/%d/vci/metadata';

/**
 * The path template for the credential single issue API endpoint.
 *
 * This constant represents the URL path for issuing a single credential.
 * The '%d' placeholder should be replaced with the appropriate service API key or version number.
 *
 * @constant
 * @type {string}
 * @example
 * // Usage example:
 * const serviceApiKey = '1234';
 * const path = CREDENTIAL_SINGLE_ISSUE_API_PATH.replace('%d', serviceApiKey);
 * // Result: '/api/1234/vci/single/issue'
 */
const CREDENTIAL_SINGLE_ISSUE_API_PATH = '/api/%d/vci/single/issue';

/**
 * The path template for the credential single parse API endpoint.
 *
 * This constant represents the URL path for credential single parse.
 */
const CREDENTIAL_SINGLE_PARSE_API_PATH = '/api/%d/vci/single/parse';

/**
 * The path template for the get service JWKS API endpoint.
 *
 * This constant represents the URL path for get service JWKS.
 */
const GET_SERVICE_JWKS_API_PATH = '/api/%d/service/jwks/get';

/**
 * The path template for the get service JWKS API endpoint.
 *
 * This constant represents the URL path for get service JWKS.
 */
const CREDENTIAL_ISSUER_JWKS_API_PATH = '/api/%d/vci/jwks';

/**
 * The path template for the standard introspection API endpoint.
 */
const STANDARD_INTROSPECTION_API_PATH = '/api/%d/auth/introspection/standard';

/**
 * The path template for the client registration API endpoint.
 */
const CLIENT_REGISTRATION_API_PATH = '/api/%d/client/registration';

/**
 * Generates the path for the pushed authentication request API.
 *
 * This function creates the specific path for the pushed authentication request API endpoint
 * by replacing the '%d' placeholder in the PUSHED_AUTH_REQ_API_PATH constant
 * with the provided service ID.
 *
 * @function
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the pushed authentication request endpoint.
 * @example
 * // Usage example:
 * const serviceId = '1234';
 * const path = pushedAuthReqPath(serviceId);
 * // Result: '/api/1234/pushed_auth_req'
 */
export const pushedAuthReqPath = (serviceId: string) =>
  PUSHED_AUTH_REQ_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the full path for Authlete's authorization API endpoint.
 *
 * This function replaces the '%d' placeholder in the AUTH_AUTHORIZATION_API_PATH
 * with the provided service ID to create the complete API path.
 *
 * @function
 * @param {string} serviceId - The service ID to be inserted into the path.
 * @returns {string} The complete path for the authorization API endpoint.
 */
export const authorizationPath = (serviceId: string) =>
  AUTH_AUTHORIZATION_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the full path for Authlete's authorization failure API endpoint.
 *
 * This function replaces the '%d' placeholder in the AUTH_AUTHORIZATION_FAIL_API_PATH
 * with the provided service ID to create the complete API path.
 *
 * @function
 * @param {string} serviceId - The service ID to be inserted into the path.
 * @returns {string} The complete path for the authorization failure API endpoint.
 * @see {@link https://docs.authlete.com/#auth-authorization-fail|Authlete API Reference: /auth/authorization/fail}
 */
export const authorizationFailPath = (serviceId: string) =>
  AUTH_AUTHORIZATION_FAIL_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the authorization issue API path for a given service ID.
 *
 * This function creates the specific path for the authorization issue API endpoint
 * by replacing the '%d' placeholder in the AUTH_AUTHORIZATION_ISSUE_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the authorization issue endpoint.
 */
export const authorizationIssuePath = (serviceId: string) =>
  AUTH_AUTHORIZATION_ISSUE_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the token API path for a given service ID.
 *
 * This function creates the specific path for the token API endpoint
 * by replacing the '%d' placeholder in the AUTH_TOKEN_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the token endpoint.
 */
export const tokenPath = (serviceId: string) =>
  AUTH_TOKEN_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the token issue API path for a given service ID.
 *
 * This function creates the specific path for the token issue API endpoint
 * by replacing the '%d' placeholder in the AUTH_TOKEN_ISSUE_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the token issue endpoint.
 */
export const tokenIssuePath = (serviceId: string) =>
  AUTH_TOKEN_ISSUE_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the token fail API path for a given service ID.
 *
 * This function creates the specific path for the token fail API endpoint
 * by replacing the '%d' placeholder in the AUTH_TOKEN_FAIL_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the token fail endpoint.
 */
export const tokenFailPath = (serviceId: string) =>
  AUTH_TOKEN_FAIL_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the token create API path for a given service ID.
 *
 * This function creates the specific path for the token create API endpoint
 * by replacing the '%d' placeholder in the AUTH_TOKEN_CREATE_API_PATH constant
 * with the provided service ID.
 */
export const tokenCreatePath = (serviceId: string) =>
  AUTH_TOKEN_CREATE_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the introspection API path for a given service ID.
 *
 * This function creates the specific path for the introspection API endpoint
 * by replacing the '%d' placeholder in the AUTH_INTROSPECTION_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the introspection endpoint.
 */
export const introspectionPath = (serviceId: string) =>
  AUTH_INTROSPECTION_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the service configuration API path for a given service ID.
 *
 * This function creates the specific path for the service configuration API endpoint
 * by replacing the '%d' placeholder in the SERVICE_CONFIGURATION_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the authorization issue endpoint.
 */
export const serviceConfigurationPath = (serviceId: string) =>
  SERVICE_CONFIGURATION_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the credential issuer metadata API path for a given service ID.
 *
 * This function creates the specific path for the service configuration API endpoint
 * by replacing the '%d' placeholder in the CREDENTIAL_ISSUER_METADATA_API_PATH constant
 * with the provided service ID.
 *
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the authorization issue endpoint.
 */
export const credentialIssuerMetadataPath = (serviceId: string) =>
  CREDENTIAL_ISSUER_METADATA_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the credential single issue API path for a given service ID.
 *
 * This function creates the specific path for the credential single issue API endpoint
 * by replacing the '%d' placeholder in the CREDENTIAL_SINGLE_ISSUE_API_PATH constant
 * with the provided service ID.
 */
export const credentialSingleIssuePath = (serviceId: string) =>
  CREDENTIAL_SINGLE_ISSUE_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the credential single parse API path for a given service ID.
 *
 * This function creates the specific path for the credential single parse API endpoint
 * by replacing the '%d' placeholder in the CREDENTIAL_SINGLE_PARSE_API_PATH constant
 * with the provided service ID.
 *
 * @function
 * @param {string} serviceId - The unique identifier for the service.
 * @returns {string} The complete API path for the credential single parse endpoint.
 * @example
 * // Usage example:
 * const serviceId = '1234';
 * const path = credentialSingleParsePath(serviceId);
 * // Result: '/api/1234/vci/single/parse'
 */
export const credentialSingleParsePath = (serviceId: string) =>
  CREDENTIAL_SINGLE_PARSE_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the get service JWKS API path for a given service ID.
 *
 * This function creates the specific path for the get service JWKS API endpoint
 * by replacing the '%d' placeholder in the GET_SERVICE_JWKS_API_PATH constant
 * with the provided service ID.
 */
export const serviceJwksPath = (serviceId: string) =>
  GET_SERVICE_JWKS_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the credential issuer JWKS API path for a given service ID.
 *
 * This function creates the specific path for the credential issuer JWKS API endpoint
 * by replacing the '%d' placeholder in the CREDENTIAL_ISSUER_JWKS_API_PATH constant
 * with the provided service ID.
 */
export const credentialIssuerJwksPath = (serviceId: string) =>
  CREDENTIAL_ISSUER_JWKS_API_PATH.replace(/%d/, serviceId);

/**
 * Generates the standard introspection API path for a given service ID.
 *
 * This function creates the specific path for the standard introspection API endpoint
 * by replacing the '%d' placeholder in the STANDARD_INTROSPECTION_API_PATH constant
 * with the provided service ID.
 */
export const standardIntrospectionPath = (serviceId: string) =>
  STANDARD_INTROSPECTION_API_PATH.replace(/%d/, serviceId);


/**
 * Generates the client registration API path for a given service ID.
 *
 * This function creates the specific path for the client registration API endpoint
 * by replacing the '%d' placeholder in the CLIENT_REGISTRATION_API_PATH constant
 * with the provided service ID.
 */
export const clientRegistrationPath = (serviceId: string) =>
  CLIENT_REGISTRATION_API_PATH.replace(/%d/, serviceId);