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

import type { SessionSchemas, StoredSessionData } from './types';

/**
 * Backing store for {@link KeyedSession}: full string-keyed snapshot per session id.
 * Implemented by {@link InMemorySessionStore} and external adapters (e.g. DynamoDB).
 */
export interface SessionSnapshotStore {
  createSessionId(): string;
  read(
    sessionId: string
  ): Promise<StoredSessionData<SessionSchemas> | undefined>;
  write(
    sessionId: string,
    data: StoredSessionData<SessionSchemas>
  ): Promise<void>;
}
