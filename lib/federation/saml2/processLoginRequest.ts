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
import { Saml2Configuration } from './Saml2Configuration';

export interface RedirectRequest {
  type: 'redirect';
  location: string;
}

export interface PostRequest {
  type: 'post';
  html: string;
}

export type LogintRequest = RedirectRequest | PostRequest;

export interface ProcessLoginRequest {
  (): Promise<LogintRequest>;
}

export interface CreateProcessLoginRequest {
  (config: Saml2Configuration): ProcessLoginRequest;
}

export const createProcessLoginRequest: CreateProcessLoginRequest = (
  config
) => {
  return async () => {
    const idp = await config.getIdp();
    const sp = await config.getSp();

    let loginRequest;

    if (sp.entityMeta.getAssertionConsumerService('simpleSign')) {
      loginRequest = sp.createLoginRequest(idp, 'post');
    } else if (sp.entityMeta.getAssertionConsumerService('post')) {
      loginRequest = sp.createLoginRequest(idp, 'post');
    } else if (sp.entityMeta.getAssertionConsumerService('redirect')) {
      loginRequest = sp.createLoginRequest(idp, 'redirect');
    } else {
      throw new TypeError('Not Supported');
    }

    if ('entityEndpoint' in loginRequest) {
      const postRequest = loginRequest;

      return {
        type: 'post',
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting to Identity Provider...</title>
          </head>
          <body>
            <p>Redirecting to Identity Provider...</p>
            <form id="saml-form" method="post" action="${
              postRequest.entityEndpoint
            }">
              <input type="hidden" name="SAMLRequest" value="${
                postRequest.context
              }" />
              ${
                postRequest.relayState
                  ? `<input type="hidden" name="RelayState" value="${postRequest.relayState}" />`
                  : ''
              }
              <noscript>
                <button type="submit">Continue</button>
              </noscript>
            </form>
            <script>
              document.getElementById('saml-form').submit();
            </script>
          </body>
        </html>
      `,
      };
    }

    return {
      type: 'redirect',
      location: loginRequest.context,
    };
  };
};
