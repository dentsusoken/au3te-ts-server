interface CreateClientRegistrationPostRequestParams {
  json?: string;
  clientId?: string;
  accessToken?: string;
}

export const createClientRegistrationRequest = ({
  json,
  clientId,
  accessToken,
}: CreateClientRegistrationPostRequestParams) => {
  const request = new Request(`http://localhost/connect/register/${clientId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: json,
  });

  return request;
};
