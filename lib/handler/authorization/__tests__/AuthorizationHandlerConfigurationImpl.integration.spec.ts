import { describe, it, expect } from 'vitest';
import {
  authorizationHandlerConfiguration,
  session,
} from '../../../testing/configurations';
import { processParPostRequest } from '../../../testing/par';
import {
  createAuthorizationRequest,
  createAuthorizationGetRequest,
} from '../../../testing/authorization';

describe('AuthorizationHandlerConfiguration Integration Tests', () => {
  it('should successfully handle API request', async () => {
    const requestUri = await processParPostRequest();
    const request = createAuthorizationRequest(requestUri);
    const response = await authorizationHandlerConfiguration.handle({
      apiRequest: request,
      options: undefined,
    });
    const decisionParams = await session.get('authorizationDecisionParams');

    expect(response.status).toBe(200);
    expect(decisionParams).toBeDefined();
    expect(decisionParams!.ticket).toBeDefined();
  }, 10000);

  it('should successfully process HTTP request', async () => {
    const requestUri = await processParPostRequest();
    const request = createAuthorizationGetRequest(requestUri);
    const response = await authorizationHandlerConfiguration.processRequest(
      request
    );
    const decisionParams = await session.get('authorizationDecisionParams');

    expect(response.status).toBe(200);
    expect(decisionParams).toBeDefined();
    expect(decisionParams!.ticket).toBeDefined();
  }, 10000);
});
