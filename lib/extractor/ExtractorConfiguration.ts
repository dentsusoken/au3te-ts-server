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

import { ExtractParameters } from './extractParameters';
import { ExtractClientCredentials } from './extractClientCredentials';
import { ExtractClientCertificateAndPath } from './extractClientCertificateAndPath';
import { ExtractAccessToken } from './extractAccessToken';
import { ExtractPathParameter } from './extractPathParameter';

/**
 * Configuration interface for extractors used in endpoint processing.
 */
export interface ExtractorConfiguration {
  /**
   * Extracts parameters from the request.
   */
  extractParameters: ExtractParameters;

  /**
   * Extracts client credentials from the request.
   */
  extractClientCredentials: ExtractClientCredentials;

  /**
   * Extracts client certificate and certificate path from the request.
   */
  extractClientCertificateAndPath: ExtractClientCertificateAndPath;

  /**
   * Extracts an access token from the request.
   */
  extractAccessToken: ExtractAccessToken;

  /**
   * Extracts path parameters from the request.
   */
  extractPathParameter: ExtractPathParameter;
}
