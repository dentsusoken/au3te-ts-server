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

import { z } from 'zod';
import { SessionSchemas, StoredSessionData, ParsedSessionData } from './types';
import { Session } from './Session';

/**
 * In-memory implementation of the Session interface.
 *
 * @template T - An object type extending SessionSchemas, defining the structure of the session data.
 */
export class InMemorySession<T extends SessionSchemas> implements Session<T> {
  private data: StoredSessionData<T> = {};
  private schemas: T;

  /**
   * Creates an instance of InMemorySession.
   *
   * @param {T} schemas - The Zod schemas for validating session data.
   */
  constructor(schemas: T) {
    this.schemas = schemas;
  }

  /**
   * Parses a stored value for a given key.
   *
   * @template K - The key type, which must be a key of T.
   * @param {K} key - The key to parse the value for.
   * @returns {z.infer<T[K]> | undefined} The parsed value, or undefined if not found or parsing fails.
   */
  parseValue<K extends keyof T>(key: K): z.output<T[K]> | undefined {
    const value = this.data[key];

    if (!value) {
      return undefined;
    }

    const parsedJson = JSON.parse(value);
    return this.schemas[key].parse(parsedJson);
  }

  /**
   * Retrieves the value associated with the specified key.
   *
   * @template K - The key type, which must be a key of T.
   * @param {K} key - The key to retrieve the value for.
   * @returns {Promise<z.infer<T[K]> | undefined>} A promise that resolves with the parsed value, or undefined if not found.
   */
  async get<K extends keyof T>(key: K): Promise<z.output<T[K]> | undefined> {
    return this.parseValue(key);
  }

  /**
   * Retrieves multiple values associated with the specified keys.
   *
   * @template K - The key type, which must be a key of T.
   * @param {...K} keys - The keys to retrieve values for.
   * @returns {Promise<ParsedSessionData<T, K>>} A promise that resolves with an object containing the retrieved and parsed values.
   */
  async getBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
    });

    return result;
  }

  /**
   * Sets the value for the specified key.
   *
   * @template K - The key type, which must be a key of T.
   * @param {K} key - The key to set the value for.
   * @param {z.infer<T[K]>} value - The value to set.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async set<K extends keyof T>(key: K, value: z.output<T[K]>): Promise<void> {
    this.data[key] = JSON.stringify(value);
  }

  /**
   * Sets multiple key-value pairs in the session.
   *
   * @template K - The key type, which must be a key of T.
   * @param {ParsedSessionData<T, K>} batch - An object containing the key-value pairs to set.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async setBatch<K extends keyof T>(
    batch: ParsedSessionData<T, K>
  ): Promise<void> {
    Object.entries(batch).forEach(([key, value]) => {
      this.data[key as K] = JSON.stringify(value);
    });
  }

  /**
   * Deletes the value associated with the specified key.
   *
   * @template K - The key type, which must be a key of T.
   * @param {K} key - The key to delete the value for.
   * @returns {Promise<z.infer<T[K]> | undefined>} A promise that resolves with the deleted value, or undefined if not found.
   */
  async delete<K extends keyof T>(key: K): Promise<z.output<T[K]> | undefined> {
    const result = this.parseValue(key);
    delete this.data[key];

    return result;
  }

  /**
   * Deletes multiple values associated with the specified keys.
   *
   * @template K - The key type, which must be a key of T.
   * @param {...K} keys - The keys to delete values for.
   * @returns {Promise<ParsedSessionData<T, K>>} A promise that resolves with an object containing the deleted values.
   */
  async deleteBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
      delete this.data[key];
    });
    return result;
  }

  /**
   * Clears all key-value pairs from the session.
   *
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async clear(): Promise<void> {
    this.data = {};
  }
}
