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

/**
 * Represents an API request with additional options.
 *
 * @template REQ - The type of the API request object
 * @template OPTS - The type of the options object
 * @property {REQ} apiRequest - The API request object
 * @property {OPTS} options - Additional options for making the API request
 */
export type ApiRequestWithOptions<REQ extends object, OPTS = unknown> = {
  apiRequest: REQ;
  options?: OPTS;
};

/**
 * Represents an API response with additional options.
 *
 * @template RES - The type of the API response
 * @template OPTS - The type of the options object
 * @property {RES} apiResponse - The API response object
 * @property {OPTS} options - Additional options associated with the API response
 */
export type ApiResponseWithOptions<RES, OPTS = unknown> = {
  apiResponse: RES;
  options?: OPTS;
};
