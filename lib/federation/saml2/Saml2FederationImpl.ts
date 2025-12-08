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
import {
  createProcessLoginRequest,
  ProcessLoginRequest,
} from './processLoginRequest';
import {
  createProcessSaml2Response,
  ProcessSaml2Response,
} from './processSaml2Response';
import {
  Saml2ConfigurationImpl,
  SamlifyValidator,
} from './Saml2ConfigurationImpl';
import { Saml2Federation } from './Saml2Federation';

export class Saml2FederationImpl implements Saml2Federation {
  readonly id: string;
  readonly type = 'saml2';
  processLoginRequest: ProcessLoginRequest;
  processSaml2Response: ProcessSaml2Response;

  constructor(config: FederationConfig, validator: SamlifyValidator) {
    this.id = config.id;
    const saml2Config = new Saml2ConfigurationImpl(config, validator);

    this.processLoginRequest = createProcessLoginRequest(saml2Config);
    this.processSaml2Response = createProcessSaml2Response(saml2Config);
  }
}
