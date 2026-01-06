import { ServiceJwksRequest } from '@vecrea/au3te-ts-common/schemas.service-jwks';
import { serviceJwksHandlerConfiguration } from './configurations';

export const createServiceJwksRequest = () => {
  const request: ServiceJwksRequest = {};

  return request;
};


export const processServiceJwksGetRequest = async () => {
  const request: ServiceJwksRequest = {};
  const response = await serviceJwksHandlerConfiguration.handle(request);
  const responseBody = await response.json();
  return responseBody['keys'][0];
};
