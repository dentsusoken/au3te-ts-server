import {MediaType} from "@vecrea/au3te-ts-common/utils"

export const createStandardIntrospectionPostRequest = (accessToken: string, accept: MediaType = MediaType.APPLICATION_INTROSPECTION_JWT) => {
  const formData = new URLSearchParams({
    token: accessToken,
    token_type_hint: 'access_token',
  });

  const request = new Request('http://localhost/api/introspect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Accept: 'application/json',
      Accept: accept,
      Authorization: `BASIC ${btoa('rs0:rs0-secret')}`,
    },
    body: formData,
  });

  return request;
};
