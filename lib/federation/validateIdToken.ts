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
import { getValidatedIdTokenClaims } from 'oauth4webapi';

/**
 * Validates an ID token and extracts its claims.
 * This is a type alias for oauth4webapi's getValidatedIdTokenClaims function.
 * @param tokenResponse - The token response containing the ID token.
 * @returns The validated ID token claims, or undefined if validation fails.
 */
export type ValidateIdToken = typeof getValidatedIdTokenClaims;
