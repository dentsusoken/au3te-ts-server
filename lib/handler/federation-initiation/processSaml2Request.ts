import { Saml2Federation } from '@/federation/saml2/Saml2Federation';
import { ResponseFactory } from '../core';

export type ProcessSaml2Request = (
  federation: Saml2Federation
) => Promise<Response>;

export type CreateProcessSaml2RequestParams = {
  responseFactory: ResponseFactory;
};

export const createProcessSaml2Request = ({
  responseFactory,
}: CreateProcessSaml2RequestParams): ProcessSaml2Request => {
  return async (federation) => {
    const request = await federation.processLoginRequest();
    if (request.type === 'post') {
      return responseFactory.html(request.html);
    }
    return responseFactory.location(request.location);
  };
};
