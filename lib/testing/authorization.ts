import { session } from './configurations';

import { AuthorizationRequest } from '@vecrea/au3te-ts-common/schemas.authorization';
import { authorizationHandlerConfiguration } from './configurations';

const CLIENT_ID = process.env.CLIENT_ID!;

export const createAuthorizationParameters = (requestUri: string) => {
  return new URLSearchParams({
    client_id: CLIENT_ID,
    request_uri: requestUri,
  }).toString();
};
export const createAuthorizationRequest = (requestUri: string) => {
  const request: AuthorizationRequest = {
    parameters: createAuthorizationParameters(requestUri),
  };

  return request;
};
export const createAuthorizationGetRequest = (requestUri: string) => {
  const request = new Request(
    `http://localhost?${createAuthorizationParameters(requestUri)}`
  );

  return request;
};
export const processAuthorizationGetRequest = async (requestUri: string) => {
  const request = createAuthorizationGetRequest(requestUri);
  await authorizationHandlerConfiguration.processRequest(request);
  const decisionParams = await session.get('authorizationDecisionParams');

  return decisionParams!.ticket!;
};
