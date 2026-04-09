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

import { SessionSchemas, StoredSessionData } from './types';
import type { CreateSessionId } from './sessionId';
import { defaultCreateSessionId } from './sessionId';
import type { SessionSnapshotStore } from './SessionSnapshotStore';

export type InMemorySessionStoreOptions = {
  /** Overrides {@link defaultCreateSessionId} when issuing new session keys. */
  createSessionId?: CreateSessionId;
};

/**
 * Process-wide in-memory backing store for {@link KeyedSession} when keyed by {@link KeyedSession#sessionId}.
 * Suitable for local development; production would swap in DynamoDB / Redis with the same session id pattern.
 */
export class InMemorySessionStore implements SessionSnapshotStore {
  private readonly buckets = new Map<string, StoredSessionData<SessionSchemas>>();
  readonly #createSessionId: CreateSessionId;

  constructor(options: InMemorySessionStoreOptions = {}) {
    this.#createSessionId = options.createSessionId ?? defaultCreateSessionId;
  }

  /** Issues a new opaque session id using the configured factory (default: UUID v4). */
  createSessionId(): string {
    return this.#createSessionId();
  }

  /** @internal */
  async read(
    sessionId: string
  ): Promise<StoredSessionData<SessionSchemas> | undefined> {
    const row = this.buckets.get(sessionId);
    return row ? { ...row } : undefined;
  }

  /** @internal */
  async write(
    sessionId: string,
    data: StoredSessionData<SessionSchemas>
  ): Promise<void> {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      this.buckets.delete(sessionId);
      return;
    }
    this.buckets.set(sessionId, { ...data });
  }
}
