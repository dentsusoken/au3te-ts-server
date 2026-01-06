import { describe, it, expect } from 'vitest';
import { standardIntrospectionHandlerConfiguration } from '@/testing/configurations';
import { processParPostRequest } from '@/testing/par';
import { processAuthorizationGetRequest } from '@/testing/authorization';
import { processAuthorizationDecisionPostRequest } from '@/testing/authorizationDecision';
import { processTokenPostRequest } from '@/testing/token';
import { createStandardIntrospectionPostRequest } from '@/testing/standardIntrospection';
import { MediaType } from '@vecrea/au3te-ts-common/utils';
import { jwtVerify, importJWK } from 'jose';
import { processServiceJwksGetRequest } from '@/testing/serviceJwks';

describe('StandardIntrospectionHandlerConfiguration Integration Tests', () => {
  it('should successfully work with processRequest and return JSON', async () => {
    const requestUri = await processParPostRequest();
    await processAuthorizationGetRequest(requestUri);
    const code = await processAuthorizationDecisionPostRequest();

    const token = await processTokenPostRequest(code);
    const request = createStandardIntrospectionPostRequest(
      token,
      MediaType.APPLICATION_JSON
    );
    const response =
      await standardIntrospectionHandlerConfiguration.processRequest(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.active).toBe(true);
  }, 10000);

  it('should successfully work with processRequest and return JWT', async () => {
    const requestUri = await processParPostRequest();
    await processAuthorizationGetRequest(requestUri);
    const code = await processAuthorizationDecisionPostRequest();
    const token = await processTokenPostRequest(code);
    const request = createStandardIntrospectionPostRequest(
      token,
      MediaType.APPLICATION_INTROSPECTION_JWT
    );
    const response =
      await standardIntrospectionHandlerConfiguration.processRequest(request);
    const responseBody = await response.text();

    const key = await processServiceJwksGetRequest();
    const publicKey = await importJWK(key);
    await expect(jwtVerify(responseBody, publicKey)).resolves.not.toThrow();
  }, 10000);
});
