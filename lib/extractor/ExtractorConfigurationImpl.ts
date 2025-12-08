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
  defaultExtractParameters,
  ExtractParameters,
} from './extractParameters';
import {
  defaultExtractClientCredentials,
  ExtractClientCredentials,
} from './extractClientCredentials';
import {
  defaultExtractClientCertificateAndPath,
  ExtractClientCertificateAndPath,
} from './extractClientCertificateAndPath';
import { ExtractorConfiguration } from './ExtractorConfiguration';
import { defaultExtractAccessToken } from './extractAccessToken';
import { ExtractAccessToken } from './extractAccessToken';
import { ExtractPathParameter } from './extractPathParameter';
import { defaultExtractPathParameter } from './extractPathParameter';

/**
 * Configuration interface for extractors used in endpoint processing.
 */
export class ExtractorConfigurationImpl implements ExtractorConfiguration {
  /**
   * Extracts parameters from the request.
   */
  extractParameters: ExtractParameters = defaultExtractParameters;

  /**
   * Extracts client credentials from the request.
   */
  extractClientCredentials: ExtractClientCredentials =
    defaultExtractClientCredentials;

  /**
   * Extracts client certificate and certificate path from the request.
   */
  extractClientCertificateAndPath: ExtractClientCertificateAndPath =
    defaultExtractClientCertificateAndPath;

  /**
   * Extracts an access token from the request.
   */
  extractAccessToken: ExtractAccessToken = defaultExtractAccessToken;

  /**
   * Extracts path parameters from the request.
   */
  extractPathParameter: ExtractPathParameter = defaultExtractPathParameter;
}
