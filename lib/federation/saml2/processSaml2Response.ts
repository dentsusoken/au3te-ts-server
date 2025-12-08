/*
 * Copyright (C) 2014-2024 Authlete, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Saml2LoginResponse,
  saml2LoginResponseSchema,
} from '@vecrea/au3te-ts-common/schemas.federation';
import { Saml2Configuration } from './Saml2Configuration';

export interface ProcessSaml2Response {
  (request: Request): Promise<Saml2LoginResponse>;
}

export interface CreateProcessSaml2Response {
  (config: Saml2Configuration): ProcessSaml2Response;
}

export const createProcessSaml2Response: CreateProcessSaml2Response = (
  config: Saml2Configuration
) => {
  return async (request) => {
    const idp = await config.getIdp();
    const sp = await config.getSp();

    if (request.method === 'POST') {
      const formData = await request.formData();
      const SAMLResponse = formData.get('SAMLResponse');
      const RelayState = formData.get('RelayState');

      if (!SAMLResponse) {
        throw new Error('SAMLResponse is not included in response.');
      }

      try {
        const { extract } = await sp.parseLoginResponse(idp, 'post', {
          body: {
            SAMLResponse,
            RelayState,
          },
        });

        return saml2LoginResponseSchema.parse(extract);
      } catch (e) {
        console.log('e :>> ', e);
      }
    }

    // Redirectバインディングの場合（GET）
    const url = new URL(request.url);
    const query = url.search;

    if (!query.includes('SAMLResponse')) {
      throw new Error('SAMLResponse is not included in response.');
    }

    const { extract } = await sp.parseLoginResponse(idp, 'redirect', {
      query,
    });

    return saml2LoginResponseSchema.parse(extract);
  };
};
