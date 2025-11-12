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

import { describe, expect, it, vi } from 'vitest';
import { AuthorizationDecisionHandlerConfigurationImpl } from '../AuthorizationDecisionHandlerConfigurationImpl';
import type { AuthorizationDecisionHandlerConfigurationImplOverrides } from '../AuthorizationDecisionHandlerConfigurationImpl';
import type { ServerHandlerConfiguration } from '../../core/ServerHandlerConfiguration';
import type { Session } from '../../../session/Session';
import { sessionSchemas } from '../../../session/sessionSchemas';
import type { ExtractorConfiguration } from '../../../extractor/ExtractorConfiguration';
import type { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import type { AuthorizationHandlerConfiguration } from '../../authorization/AuthorizationHandlerConfiguration';
import type { AuthorizationIssueHandlerConfiguration } from '../../authorization-issue';
import type { AuthorizationFailHandlerConfiguration } from '../../authorization-fail';
import type { ResponseErrorFactory } from '../../core/responseErrorFactory';
import type { User } from '@vecrea/au3te-ts-common/schemas.common';

/*
| ケース | 等価分割観点 | 境界値観点 | 入力条件 | 期待結果 | 正常/異常 |
| --- | --- | --- | --- | --- | --- |
| 1 | オーバーライド未指定 | - | overrides を渡さない | 既定の依存が設定される | 正常 |
| 2 | collectClaims 差し替え | - | collectClaims を上書き | 差し替えた関数が利用される | 正常 |
| 3 | processRequest オーバーライド失敗 | - | createProcessRequest が例外を投げる | 例外が呼び出し側へ伝播する | 異常 |
| 4 | toApiRequest 上書き失敗 | - | toApiRequest が例外を投げる | 例外が呼び出し側へ伝播する | 異常 |
| 5 | createToApiRequest オーバーライド失敗 | - | createToApiRequest が失敗関数を返す | 例外が伝播しファクトリが呼ばれる | 異常 |
| 6 | getOrAuthenticateUser 差し替え失敗 | - | getOrAuthenticateUser が例外を投げる | 例外が呼び出し側へ伝播する | 異常 |
*/

type Dependencies = {
  serverHandlerConfiguration: ServerHandlerConfiguration<typeof sessionSchemas>;
  extractorConfiguration: ExtractorConfiguration;
  userHandlerConfiguration: UserHandlerConfiguration;
  authorizationHandlerConfiguration: AuthorizationHandlerConfiguration<typeof sessionSchemas, unknown>;
  authorizationIssueHandlerConfiguration: AuthorizationIssueHandlerConfiguration;
  authorizationFailHandlerConfiguration: AuthorizationFailHandlerConfiguration;
};

const createDependencies = (): Dependencies => {
  const session = {
    get: vi.fn(),
    getBatch: vi.fn(),
    set: vi.fn(),
    setBatch: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    deleteBatch: vi.fn(async () => ({
      authorizationDecisionParams: {
        ticket: 'ticket',
        claimNames: [],
        requestedClaimsForTx: [],
      },
      acrs: [],
      client: {},
    })),
  } as unknown as Session<typeof sessionSchemas>;

  const responseErrorFactory = {
    badRequestResponseError: vi.fn((message: string) => new Error(message)),
  } as unknown as ResponseErrorFactory;

  const serverHandlerConfiguration = {
    apiClient: {},
    session,
    responseErrorFactory,
    recoverResponseResult: vi.fn(async () => new Response(null, { status: 500 })),
    prepareHeaders: vi.fn(),
    buildUnknownActionMessage: vi.fn(),
  } as unknown as ServerHandlerConfiguration<typeof sessionSchemas>;

  const extractorConfiguration = {
    extractParameters: vi.fn(async () => 'authorized=true&loginId=user&password=pass'),
  } as unknown as ExtractorConfiguration;

  const userHandlerConfiguration = {
    getByCredentials: vi.fn(async () => ({ subject: 'user' })),
  } as unknown as UserHandlerConfiguration;

  const authorizationHandlerConfiguration = {
    calcSub: vi.fn(async () => 'sub'),
  } as unknown as AuthorizationHandlerConfiguration<typeof sessionSchemas>;

  const authorizationIssueHandlerConfiguration = {
    handle: vi.fn(async () => new Response(null, { status: 204 })),
  } as unknown as AuthorizationIssueHandlerConfiguration;

  const authorizationFailHandlerConfiguration = {
    buildAuthorizationFailError: vi.fn(async (ticket: string, reason: string) =>
      new Error(`${ticket}:${reason}`)
    ),
  } as unknown as AuthorizationFailHandlerConfiguration;

  return {
    serverHandlerConfiguration,
    extractorConfiguration,
    userHandlerConfiguration,
    authorizationHandlerConfiguration,
    authorizationIssueHandlerConfiguration,
    authorizationFailHandlerConfiguration,
  };
};

const createConfig = (
  overrides?: AuthorizationDecisionHandlerConfigurationImplOverrides
) => {
  const dependencies = createDependencies();
  const config = new AuthorizationDecisionHandlerConfigurationImpl({
    ...dependencies,
    overrides,
  });

  return { config, dependencies };
};

describe('AuthorizationDecisionHandlerConfigurationImpl', () => {
  it('should initialize with default dependencies when overrides are absent', () => {
    // Given default dependencies without overrides
    const { config } = createConfig();

    // When inspecting the generated configuration
    // Then all core members should be defined
    expect(config.path).toBe('/api/authorization/decision');
    expect(config.collectClaims).toBeDefined();
    expect(config.getOrAuthenticateUser).toBeDefined();
    expect(config.toApiRequest).toBeDefined();
    expect(config.processRequest).toBeDefined();
  });

  it('should prefer an overridden collectClaims implementation when provided', () => {
    // Given an override replacing collectClaims
    const collectClaimsOverride = vi.fn(() => ({ foo: 'bar' }));

    const { config } = createConfig({ collectClaims: collectClaimsOverride });

    // When invoking the overridden collectClaims
    const result = config.collectClaims(
      ['foo'],
      { foo: 'value' } as unknown as User
    );

    // Then the override is used
    expect(result).toEqual({ foo: 'bar' });
    expect(collectClaimsOverride).toHaveBeenCalledOnce();
  });

  it('should propagate errors from an overridden processRequest factory', async () => {
    // Given a createProcessRequest override that throws
    const processRequestError = new Error('invalid request');
    const createProcessRequestOverride = vi.fn(
      () => vi.fn(async () => {
        throw processRequestError;
      })
    );

    const { config } = createConfig({
      createProcessRequest: createProcessRequestOverride,
    });

    // When invoking processRequest created by the override
    await expect(
      config.processRequest(new Request('https://example.com/decision', { method: 'POST' }))
    ).rejects.toBe(processRequestError);

    // Then the override factory is executed exactly once
    expect(createProcessRequestOverride).toHaveBeenCalledOnce();
  });

  it('should propagate errors from a directly overridden toApiRequest', async () => {
    // Given a toApiRequest override that rejects
    const rejection = new Error('denied');
    const toApiRequestOverride = vi.fn(async () => {
      throw rejection;
    });

    const { config } = createConfig({ toApiRequest: toApiRequestOverride });

    // When calling the overridden toApiRequest
    await expect(config.toApiRequest(new Request('https://example.com'))).rejects.toBe(
      rejection
    );

    // Then the override should be invoked once
    expect(toApiRequestOverride).toHaveBeenCalledOnce();
  });

  it('should invoke the createToApiRequest factory when provided and propagate its errors', async () => {
    // Given a factory overriding createToApiRequest that produces a failing handler
    const rejection = new Error('factory rejection');
    const createToApiRequestOverride = vi.fn(
      () => vi.fn(async () => {
        throw rejection;
      })
    );

    const { config } = createConfig({
      createToApiRequest: createToApiRequestOverride,
    });

    // When executing the handler produced by the factory
    await expect(config.toApiRequest(new Request('https://example.com'))).rejects.toBe(
      rejection
    );

    // Then the factory must have been evaluated
    expect(createToApiRequestOverride).toHaveBeenCalledOnce();
  });

  it('should propagate errors from an overridden getOrAuthenticateUser', async () => {
    // Given an override for getOrAuthenticateUser that throws
    const rejection = new Error('authentication failed');
    const getOrAuthenticateUserOverride = vi.fn(async () => {
      throw rejection;
    });

    const { config, dependencies } = createConfig({
      getOrAuthenticateUser: getOrAuthenticateUserOverride,
    });

    // When invoking the overridden authenticator
    await expect(
      config.getOrAuthenticateUser(
        dependencies.serverHandlerConfiguration.session,
        {}
      )
    ).rejects.toBe(rejection);

    // Then the override should be called exactly once
    expect(getOrAuthenticateUserOverride).toHaveBeenCalledOnce();
  });
});
