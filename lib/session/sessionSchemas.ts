/*
 * Copyright (C) 2019-2024 Authlete, Inc.
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

import { z } from 'zod';
import { userSchema, clientSchema } from '@vecrea/au3te-ts-common/schemas.common';
import { authorizationDecisionParamsSchema } from '@vecrea/au3te-ts-common/schemas.authorization-decision';
import { SessionSchemas } from './types';

export const sessionSchemas = {
  authorizationDecisionParams: authorizationDecisionParamsSchema,
  acrs: z.array(z.string()).nullish(),
  user: userSchema,
  client: clientSchema,
  authTime: z.number(),
} satisfies SessionSchemas;
