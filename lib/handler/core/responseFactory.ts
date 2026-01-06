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
  HttpStatus,
  MediaType,
  getStatusText,
} from '@vecrea/au3te-ts-common/utils';

/**
 * Fixed headers to be included in all responses.
 */
const fixedHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
};

/** Type alias for headers object. */
export type Headers = Record<string, string>;

/**
 * Interface for ResponseFactory that provides methods to create HTTP responses.
 */
export interface ResponseFactory {
  /**
   * Creates a new Response object with the specified status, content type, body, and headers.
   */
  createResponse(
    status: HttpStatus,
    contentType: MediaType | undefined,
    body: string | undefined | null,
    headers?: Headers
  ): Response;

  /**
   * Creates a 200 OK response.
   */
  ok(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 200 OK response.
   */
  html(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 200 OK response with JWT content type.
   */
  okJwt(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 200 OK response with Introspection JWT content type.
   */
  okIntrospectionJwt(body?: string | null, headers?: Headers): Response;

  /**
   * Creates an HTTP response with a 200 OK status and HTML content.
   */
  form(body?: string | null): Response;

  /**
   * Creates a 201 Created response.
   */
  created(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 202 Accepted response with JSON content type.
   */
  accepted(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 202 Accepted response with JWT content type.
   */
  acceptedJwt(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 204 No Content response.
   */
  noContent(): Response;

  /**
   * Creates a 302 Found response with a Location header for redirection.
   */
  location(location: string): Response;

  /**
   * Creates a 400 Bad Request response.
   */
  badRequest(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 401 Unauthorized response.
   */
  unauthorized(
    body?: string | null,
    challenge?: string | null,
    headers?: Headers
  ): Response;

  /**
   * Creates a 403 Forbidden response.
   */
  forbidden(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 404 Not Found response.
   */
  notFound(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 413 Request Entity Too Large response.
   */
  tooLarge(body?: string | null, headers?: Headers): Response;

  /**
   * Creates a 500 Internal Server Error response.
   */
  internalServerError(body?: string | null, headers?: Headers): Response;
}

export const defaultResponseFactory: ResponseFactory = {
  createResponse: (
    status: HttpStatus,
    contentType: MediaType | undefined,
    body: string | undefined | null,
    headers: Headers = {}
  ) => {
    const newHeaders: Headers = {
      ...fixedHeaders,
      ...headers,
    };

    if (contentType) {
      newHeaders['Content-Type'] = contentType;
    }
    return new Response(body, {
      status,
      statusText: getStatusText(status),
      headers: newHeaders,
    });
  },

  ok: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.OK,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    ),

  html: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.OK,
      MediaType.TEXT_HTML_UTF8,
      body,
      headers
    ),

  okJwt: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.OK,
      MediaType.APPLICATION_JWT,
      body,
      headers
    ),

  okIntrospectionJwt: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.OK,
      MediaType.APPLICATION_INTROSPECTION_JWT,
      body,
      headers
    ),

  form: (body?: string | null) =>
    defaultResponseFactory.createResponse(
      HttpStatus.OK,
      MediaType.TEXT_HTML_UTF8,
      body
    ),

  created: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.CREATED,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    ),

  accepted: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.ACCEPTED,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    ),

  acceptedJwt: (body?: string | null, headers?: Headers) =>
    defaultResponseFactory.createResponse(
      HttpStatus.ACCEPTED,
      MediaType.APPLICATION_JWT,
      body,
      headers
    ),

  noContent: () =>
    defaultResponseFactory.createResponse(
      HttpStatus.NO_CONTENT,
      undefined,
      undefined
    ),

  location: (location: string) =>
    defaultResponseFactory.createResponse(
      HttpStatus.FOUND,
      undefined,
      undefined,
      {
        Location: location,
      }
    ),

  badRequest: (body?: string | null, headers?: Headers) => {
    return defaultResponseFactory.createResponse(
      HttpStatus.BAD_REQUEST,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    );
  },

  unauthorized: (
    body?: string | null,
    challenge?: string | null,
    headers?: Headers
  ) => {
    const responseHeaders: Headers = { ...headers };

    if (challenge) {
      responseHeaders['WWW-Authenticate'] = challenge;
    }

    return defaultResponseFactory.createResponse(
      HttpStatus.UNAUTHORIZED,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      responseHeaders
    );
  },

  forbidden: (body?: string | null, headers?: Headers) => {
    return defaultResponseFactory.createResponse(
      HttpStatus.FORBIDDEN,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    );
  },

  notFound: (body?: string | null, headers?: Headers) => {
    return defaultResponseFactory.createResponse(
      HttpStatus.NOT_FOUND,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    );
  },

  tooLarge: (body?: string | null, headers?: Headers) => {
    return defaultResponseFactory.createResponse(
      HttpStatus.REQUEST_ENTITY_TOO_LARGE,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    );
  },

  internalServerError: (body?: string | null, headers?: Headers) => {
    return defaultResponseFactory.createResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      MediaType.APPLICATION_JSON_UTF8,
      body,
      headers
    );
  },
};
