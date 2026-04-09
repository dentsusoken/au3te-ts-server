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
import type { SessionSnapshotStore } from './SessionSnapshotStore';

/**
 * Generic {@link Session} built from Zod schemas and a synchronous key–value snapshot store.
 *
 * - **Keyed** — pass `sessionId` and a {@link SessionSnapshotStore}; the id is usually
 *   a cookie or database partition key (see {@link InMemorySessionStore} for in-process storage).
 * - **Ephemeral** — `new KeyedSession(schemas)` keeps data only inside the instance (`sessionId` is `''`);
 *   for unit tests and single-process shortcuts.
 *
 * @template T - Zod schemas per session key. Production code typically uses {@link DefaultSessionSchemas}.
 */
export class KeyedSession<T extends SessionSchemas> implements Session<T> {
  readonly sessionId: string;
  private readonly schemas: T;
  private readonly store: SessionSnapshotStore | null;
  private data: StoredSessionData<T> = {};
  private loaded = false;

  constructor(schemas: T);
  constructor(schemas: T, sessionId: string, store: SessionSnapshotStore);
  constructor(
    schemas: T,
    sessionId?: string,
    store?: SessionSnapshotStore
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

  private async ensureLoaded(): Promise<void> {
    if (this.store === null) {
      return;
    }
    if (this.loaded) {
      return;
    }
    const snapshot = await this.store.read(this.sessionId);
    this.data = (snapshot
      ? { ...snapshot }
      : {}) as StoredSessionData<T>;
    this.loaded = true;
  }

  private async persist(): Promise<void> {
    if (this.store === null) {
      return;
    }
    await this.store.write(
      this.sessionId,
      { ...this.data } as StoredSessionData<SessionSchemas>
    );
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
    await this.ensureLoaded();
    return this.parseValue(key);
  }

  async getBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    await this.ensureLoaded();
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
    });

    return result;
  }

  async set<K extends keyof T>(key: K, value: z.output<T[K]>): Promise<void> {
    await this.ensureLoaded();
    this.data[key] = JSON.stringify(value);
    await this.persist();
  }

  async setBatch<K extends keyof T>(
    batch: ParsedSessionData<T, K>
  ): Promise<void> {
    await this.ensureLoaded();
    Object.entries(batch).forEach(([key, value]) => {
      this.data[key as K] = JSON.stringify(value);
    });
    await this.persist();
  }

  async delete<K extends keyof T>(key: K): Promise<z.output<T[K]> | undefined> {
    await this.ensureLoaded();
    const result = this.parseValue(key);
    delete this.data[key];
    await this.persist();

    return result;
  }

  async deleteBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<ParsedSessionData<T, K>> {
    await this.ensureLoaded();
    const result: ParsedSessionData<T, K> = {};

    keys.forEach((key) => {
      result[key] = this.parseValue(key);
      delete this.data[key];
    });
    await this.persist();
    return result;
  }

  async clear(): Promise<void> {
    await this.ensureLoaded();
    this.data = {} as StoredSessionData<T>;
    await this.persist();
  }
}
