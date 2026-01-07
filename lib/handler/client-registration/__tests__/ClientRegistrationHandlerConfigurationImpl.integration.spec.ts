import { describe, it, expect } from 'vitest';
import { clientRegistrationHandlerConfiguration } from '@/testing/configurations';
import { createClientRegistrationRequest } from '@/testing/clientRegistration';

describe.sequential('ClientRegistrationHandlerConfigurationImpl Integration Tests', () => {
  let clientId = '';
  let accessToken = '';

  it('should successfully work with processRequest and create a client', async () => {
    const request = createClientRegistrationRequest({
      json: '{ "client_name": "My Dynamic Client" }',
    });
    const response = await clientRegistrationHandlerConfiguration(
      'create'
    ).processRequest(request);
    const responseBody = await response.json();

    clientId = responseBody.client_id;
    accessToken = responseBody.registration_access_token;

    expect(response.status).toBe(201);
    expect(responseBody.client_id).toBeDefined();
    expect(responseBody.registration_access_token).toBeDefined();

  }, 10000);

  it('should successfully work with processRequest and get a client', async () => {
    expect(clientId).toBeTruthy();
    expect(accessToken).toBeTruthy();

    const request = createClientRegistrationRequest({
      json: '{ "client_name": "My Dynamic Client" }',
      clientId,
      accessToken,
    });
    const response = await clientRegistrationHandlerConfiguration(
      'get'
    ).processRequest(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.client_id).toBe(clientId);
  });

  it('should successfully work with processRequest and update a client', async () => {
    expect(clientId).toBeTruthy();
    expect(accessToken).toBeTruthy();

    const request = createClientRegistrationRequest({
      json: JSON.stringify({ client_name: 'My Updated Client', client_id: clientId }),
      clientId,
      accessToken,
    });
    const response = await clientRegistrationHandlerConfiguration(
      'update'
    ).processRequest(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody.client_id).toBe(clientId);
    expect(responseBody.client_name).toBe('My Updated Client');
  });

  it('should successfully work with processRequest and delete a client', async () => {
    expect(clientId).toBeTruthy();
    expect(accessToken).toBeTruthy();

    const request = createClientRegistrationRequest({
      json: JSON.stringify({ client_id: clientId }),
      clientId,
      accessToken,
    });
    const response = await clientRegistrationHandlerConfiguration(
      'delete'
    ).processRequest(request);

    expect(response.status).toBe(204);
  });
});