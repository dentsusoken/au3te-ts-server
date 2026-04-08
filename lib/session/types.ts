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

/**
 * Represents a record of Zod schemas for session data.
 * Each key in the record corresponds to a session data field,
 * and its value is a Zod schema defining the structure and validation rules for that field.
 */
export type SessionSchemas = Record<string, z.ZodTypeAny>;

/**
 * Represents the stored format of session data.
 * All values are stored as strings, typically JSON-serialized.
 *
 * @template T - A type extending SessionSchemas, defining the structure of the session data.
 */
export type StoredSessionData<T extends SessionSchemas> = {
  [K in keyof T]?: string;
};

/**
 * Represents the parsed format of session data.
 * Values are parsed according to their corresponding Zod schemas.
 *
 * @template T - A type extending SessionSchemas, defining the structure of the session data.
 * @template K - A union type of keys from T, representing the subset of session data being parsed.
 */
export type ParsedSessionData<T extends SessionSchemas, K extends keyof T> = {
  [P in K]?: z.output<T[P]>;
};
