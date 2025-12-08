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
import { FederationConfig } from '@vecrea/au3te-ts-common/schemas.federation';
import { Saml2Configuration } from './Saml2Configuration';
import * as samlify from 'samlify';

export type SamlifyValidator = Parameters<typeof samlify.setSchemaValidator>[0];

type Saml2FederationConfig = Extract<FederationConfig, { protocol: 'saml2' }>;

export class Saml2ConfigurationImpl implements Saml2Configuration {
  #config: Saml2FederationConfig;

  constructor(config: FederationConfig, validator: SamlifyValidator) {
    if (config.protocol !== 'saml2') {
      throw new Error(
        `Unsupported protocol: ${config.protocol}. Only 'saml2' protocol is supported.`
      );
    }
    this.#config = config;
    samlify.setSchemaValidator(validator);
  }

  private async resolveIdpMetadat() {
    const metadata = this.#config.idp.metadata;
    if (metadata) {
      return;
    }

    if (!metadata && 'metadataUrl' in this.#config.idp) {
      const response = await fetch(this.#config.idp.metadataUrl);
      this.#config.idp.metadata = await response.text();
    }
  }

  async getIdp(): Promise<samlify.IdentityProviderInstance> {
    await this.resolveIdpMetadat();
    return samlify.IdentityProvider(this.#config.idp);
  }

  async getSp(): Promise<samlify.ServiceProviderInstance> {
    return samlify.ServiceProvider(this.#config.sp);
  }
}
