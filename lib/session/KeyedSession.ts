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
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';
import { StoredSessionData, ParsedSessionData, SessionSchemas } from './types';
import { Session } from './Session';
import { InMemorySessionStore } from './InMemorySessionStore';

/**
 * Generic {@link Session} built from Zod schemas and a synchronous key–value snapshot store.
 *
 * - **Keyed** — pass `sessionId` and a store (e.g. {@link InMemorySessionStore}); the id is usually
 *   a cookie or database partition key. Other backends can be supported once they expose the same
 *   read/write snapshot contract.
 * - **Ephemeral** — `new KeyedSession(schemas)` keeps data only inside the instance (`sessionId` is `''`);
 *   for unit tests and single-process shortcuts.
 *
 * @template T - Zod schemas per session key. Production code typically uses {@link DefaultSessionSchemas}.
 */
export class KeyedSession<T extends SessionSchemas> implements Session<T> {
  readonly sessionId: string;
  private readonly schemas: T;
  private readonly store: InMemorySessionStore | null;
  private data: StoredSessionData<T> = {};
  private loaded = false;

  constructor(schemas: T);
  constructor(schemas: T, sessionId: string, store: InMemorySessionStore);
  constructor(
    schemas: T,
    sessionId?: string,
    store?: InMemorySessionStore
  ) {
    this.schemas = schemas;
    if (sessionId !== undefined && store !== undefined) {
      this.sessionId = sessionId;
      this.store = store;
    } else {
      this.sessionId = '';
      this.store = null;
    }
  }

  private ensureLoaded(): void {
    if (this.store === null) {
      return;
    }
    if (this.loaded) {
      return;
    }
    const snapshot = this.store.read(this.sessionId);
    this.data = (snapshot
      ? { ...snapshot }
      : {}) as StoredSessionData<T>;
    this.loaded = true;
  }

  private persist(): void {
    if (this.store === null) {
      return;
    }
    this.store.write(this.sessionId, { ...this.data } as StoredSessionData<SessionSchemas>);
  }

  parseValue<K extends keyof T>(key: K): z.output<T[K]> | undefined {
    const value = this.data[key];

    if (!value) {
      return undefined;
    }

    const parsedJson = JSON.parse(value);
    return (this.schemas[key] as z.ZodTypeAny).parse(parsedJson) as z.output<
      T[K]
    >;
  }

  async get<K extends keyof T>(key: K): Promise<z.output<T[K]> | undefined> {
    this.ensureLoaded();
    return this.parseValue(key);
  }

  async getBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    this.ensureLoaded();
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
    });

    return result;
  }

  async set<K extends keyof T>(key: K, value: z.output<T[K]>): Promise<void> {
    this.ensureLoaded();
    this.data[key] = JSON.stringify(value);
    this.persist();
  }

  async setBatch<K extends keyof T>(
    batch: ParsedSessionData<T, K>
  ): Promise<void> {
    this.ensureLoaded();
    Object.entries(batch).forEach(([key, value]) => {
      this.data[key as K] = JSON.stringify(value);
    });
    this.persist();
  }

  async delete<K extends keyof T>(key: K): Promise<z.output<T[K]> | undefined> {
    this.ensureLoaded();
    const result = this.parseValue(key);
    delete this.data[key];
    this.persist();

    return result;
  }

  async deleteBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    this.ensureLoaded();
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
      delete this.data[key];
    });
    this.persist();
    return result;
  }

  async clear(): Promise<void> {
    this.ensureLoaded();
    this.data = {} as StoredSessionData<T>;
    this.persist();
  }
}
