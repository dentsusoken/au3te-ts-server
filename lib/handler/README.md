# Handler Configuration Guide

This directory contains handler configurations for processing OAuth 2.0 and OpenID Connect endpoints.

## Directory Structure

```
lib/handler/
├── core/                    # Core functionality and utilities
│   ├── index.ts            # Main exports for core functionality
│   ├── responseFactory.ts  # HTTP response creation
│   ├── responseErrorFactory.ts # Error response creation
│   ├── ResponseError.ts    # Error class for HTTP responses
│   ├── ServerHandlerConfiguration.ts # Base server configuration interface
│   ├── ServerHandlerConfigurationImpl.ts # Base server configuration implementation
│   ├── processApiRequest.ts # API request processing
│   ├── processApiResponse.ts # API response processing
│   ├── validateApiResponse.ts # API response validation
│   ├── handle.ts           # Request handling
│   ├── handleWithOptions.ts # Request handling with options
│   ├── prepareHeaders.ts   # Header preparation
│   ├── toApiRequest.ts     # Request transformation
│   ├── toClientAuthRequest.ts # Client auth request transformation
│   ├── types.ts            # Common type definitions
│   ├── recoverResponseResult.ts # Response result recovery
│   └── __tests__/          # Core functionality tests
├── constants/              # Constants and configuration values
│   └── index.ts
├── authorization/          # Authorization endpoint handlers
├── authorization-decision/ # Authorization decision handlers
├── authorization-fail/     # Authorization failure handlers
├── authorization-issue/    # Authorization issue handlers
├── token/                  # Token endpoint handlers
├── token-create/           # Token creation handlers
├── token-fail/             # Token failure handlers
├── token-issue/            # Token issue handlers
├── credential/             # Credential endpoint handlers
├── credential-metadata/    # Credential metadata handlers
├── credential-single-issue/ # Credential single issue handlers
├── credential-single-parse/ # Credential single parse handlers
├── credential-issuer-jwks/ # Credential issuer JWKS handlers
├── introspection/          # Token introspection handlers
├── par/                    # Pushed Authorization Request handlers
├── service-configuration/  # Service configuration handlers
├── service-jwks/           # Service JWKS handlers
└── README.md               # This file
```

## Overview

Each endpoint follows this implementation pattern:

1. **HandlerConfiguration**: Interface for endpoint configuration
2. **HandlerConfigurationImpl**: Implementation class for the configuration
3. **processRequest()**: Method to process actual HTTP requests

## Basic Usage

### 1. Creating HandlerConfiguration

Create HandlerConfiguration for each endpoint:

```typescript
import { ApiClientImpl } from '@vecrea/au3te-ts-server/api';
import { AuthleteConfiguration } from '@vecrea/au3te-ts-common/conf';
import { sessionSchemas } from '@vecrea/au3te-ts-server/session';
import { KeyedSession } from '@vecrea/au3te-ts-server/session';
import { ServerHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/core';
import { ExtractorConfigurationImpl } from '@vecrea/au3te-ts-server/extractor';
import { TokenHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token';
import { TokenCreateHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-create';
import { TokenFailHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-fail';
import { TokenIssueHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-issue';
import { AuthorizationHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization';
import { AuthorizationIssueHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization-issue';
import { AuthorizationFailHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization-fail';
import { AuthorizationPageHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.authorization-page';
import { UserHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.user';

// Authlete configuration
const configuration: AuthleteConfiguration = {
  apiVersion: process.env.API_VERSION || '',
  baseUrl: process.env.API_BASE_URL || '',
  serviceApiKey: process.env.API_KEY || '',
  serviceAccessToken: process.env.ACCESS_TOKEN || '',
};

// Base configurations
const apiClient = new ApiClientImpl(configuration);
const session = new KeyedSession(sessionSchemas);
const serverHandlerConfiguration = new ServerHandlerConfigurationImpl(
  apiClient,
  session
);
const extractorConfiguration = new ExtractorConfigurationImpl();

// User configuration
const userHandlerConfiguration = new UserHandlerConfigurationImpl();

// Token-related configurations
const tokenCreateHandlerConfiguration = new TokenCreateHandlerConfigurationImpl(
  serverHandlerConfiguration
);
const tokenFailHandlerConfiguration = new TokenFailHandlerConfigurationImpl(
  serverHandlerConfiguration
);
const tokenIssueHandlerConfiguration = new TokenIssueHandlerConfigurationImpl(
  serverHandlerConfiguration
);

const tokenConfig = new TokenHandlerConfigurationImpl({
  serverHandlerConfiguration,
  userHandlerConfiguration,
  tokenFailHandlerConfiguration,
  tokenIssueHandlerConfiguration,
  tokenCreateHandlerConfiguration,
  extractorConfiguration,
});

// Authorization-related configurations
const authorizationIssueHandlerConfiguration =
  new AuthorizationIssueHandlerConfigurationImpl(serverHandlerConfiguration);
const authorizationFailHandlerConfiguration =
  new AuthorizationFailHandlerConfigurationImpl(serverHandlerConfiguration);
const authorizationPageHandlerConfiguration =
  new AuthorizationPageHandlerConfigurationImpl();

const authorizationConfig = new AuthorizationHandlerConfigurationImpl({
  serverHandlerConfiguration,
  authorizationIssueHandlerConfiguration,
  authorizationFailHandlerConfiguration,
  authorizationPageHandlerConfiguration,
  extractorConfiguration,
});
```

### 2. Using in Endpoints

In actual endpoints (e.g., Hono), call `processRequest()`:

```typescript
import { Hono } from 'hono';
import { TokenHandlerConfiguration } from '@vecrea/au3te-ts-server/handler/token';

const app = new Hono();

// Token endpoint
app.post('/api/token', async (c) => {
  try {
    // Get raw Request from Hono
    const request = c.req.raw;

    // Call processRequest() from HandlerConfiguration
    const response = await tokenConfig.processRequest(request);

    // Return the response directly
    return response;
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Authorization endpoint
app.get('/api/authorization', async (c) => {
  try {
    // Get raw Request from Hono
    const request = c.req.raw;

    const response = await authorizationConfig.processRequest(request);

    // Return the response directly
    return response;
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
```

## Core Module

The `core` module provides essential functionality used by all handlers:

```typescript
import {
  ServerHandlerConfigurationImpl,
  responseFactory,
  responseErrorFactory,
  ResponseError,
  processApiRequest,
  processApiResponse,
  validateApiResponse,
  handle,
  handleWithOptions,
  prepareHeaders,
  toApiRequest,
  toClientAuthRequest,
  types,
  recoverResponseResult,
} from '@vecrea/au3te-ts-server/handler/core';
```

### Core Components

- **ServerHandlerConfiguration**: Base configuration for all server handlers
- **responseFactory**: Factory for creating HTTP responses
- **responseErrorFactory**: Factory for creating error responses
- **ResponseError**: Error class for HTTP error responses
- **processApiRequest/processApiResponse**: API request/response processing
- **validateApiResponse**: API response validation utilities
- **handle/handleWithOptions**: Request handling utilities
- **prepareHeaders**: Header preparation utilities
- **toApiRequest/toClientAuthRequest**: Request transformation utilities

## Available Endpoints

### Token Endpoint (`/handler/token/`)

Handles OAuth 2.0 token endpoint.

```typescript
import { TokenHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token';

const tokenConfig = new TokenHandlerConfigurationImpl({
  serverHandlerConfiguration: serverConfig,
  userHandlerConfiguration: userConfig,
  tokenFailHandlerConfiguration: tokenFailConfig,
  tokenIssueHandlerConfiguration: tokenIssueConfig,
  tokenCreateHandlerConfiguration: tokenCreateConfig,
  extractorConfiguration: extractorConfig,
});

// Usage example
const response = await tokenConfig.processRequest(request);
```

### Authorization Endpoint (`/handler/authorization/`)

Handles OAuth 2.0 authorization endpoint.

```typescript
import { AuthorizationHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization';

const authorizationConfig = new AuthorizationHandlerConfigurationImpl({
  serverHandlerConfiguration: serverConfig,
  userHandlerConfiguration: userConfig,
  authorizationFailHandlerConfiguration: authFailConfig,
  authorizationIssueHandlerConfiguration: authIssueConfig,
  extractorConfiguration: extractorConfig,
});

// Usage example
const response = await authorizationConfig.processRequest(request);
```

### Authorization Decision Endpoint (`/handler/authorization-decision/`)

Handles authorization decision endpoint.

```typescript
import { AuthorizationDecisionHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization-decision';

const authDecisionConfig = new AuthorizationDecisionHandlerConfigurationImpl({
  serverHandlerConfiguration: serverConfig,
  userHandlerConfiguration: userConfig,
  extractorConfiguration: extractorConfig,
});

// Usage example
const response = await authDecisionConfig.processRequest(request);
```

### Authorization Issue Endpoint (`/handler/authorization-issue/`)

Handles authorization issue endpoint.

```typescript
import { AuthorizationIssueHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization-issue';

const authIssueConfig = new AuthorizationIssueHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await authIssueConfig.processRequest(request);
```

### Authorization Fail Endpoint (`/handler/authorization-fail/`)

Handles authorization fail endpoint.

```typescript
import { AuthorizationFailHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/authorization-fail';

const authFailConfig = new AuthorizationFailHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await authFailConfig.processRequest(request);
```

### Token Issue Endpoint (`/handler/token-issue/`)

Handles token issue endpoint.

```typescript
import { TokenIssueHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-issue';

const tokenIssueConfig = new TokenIssueHandlerConfigurationImpl(serverConfig);

// Usage example
const response = await tokenIssueConfig.processRequest(request);
```

### Token Create Endpoint (`/handler/token-create/`)

Handles token create endpoint.

```typescript
import { TokenCreateHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-create';

const tokenCreateConfig = new TokenCreateHandlerConfigurationImpl(serverConfig);

// Usage example
const response = await tokenCreateConfig.processRequest(request);
```

### Token Fail Endpoint (`/handler/token-fail/`)

Handles token fail endpoint.

```typescript
import { TokenFailHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/token-fail';

const tokenFailConfig = new TokenFailHandlerConfigurationImpl(serverConfig);

// Usage example
const response = await tokenFailConfig.processRequest(request);
```

### Introspection Endpoint (`/handler/introspection/`)

Handles token introspection endpoint.

```typescript
import { IntrospectionHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/introspection';

const introspectionConfig = new IntrospectionHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await introspectionConfig.processRequest(request);
```

### PAR Endpoint (`/handler/par/`)

Handles Pushed Authorization Request endpoint.

```typescript
import { ParHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/par';

const parConfig = new ParHandlerConfigurationImpl({
  serverHandlerConfiguration: serverConfig,
  extractorConfiguration: extractorConfig,
});

// Usage example
const response = await parConfig.processRequest(request);
```

### Credential Endpoints

#### Common Credential Handler (`@vecrea/au3te-ts-common/handler.credential`)

```typescript
import { CommonCredentialHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler.credential';

const commonCredentialConfig = new CommonCredentialHandlerConfigurationImpl({
  userHandlerConfiguration,
});

// Usage example
const response = await commonCredentialConfig.processRequest(request);
```

#### Base Credential Handler (`/handler/credential/`)

```typescript
import { BaseCredentialHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/credential';

const baseCredentialConfig = new BaseCredentialHandlerConfigurationImpl({
  credentialMetadataHandlerConfiguration,
});

// Usage example
const response = await baseCredentialConfig.processRequest(request);
```

#### Credential Metadata (`/handler/credential-metadata/`)

```typescript
import { CredentialMetadataHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/credential-metadata';

const credentialMetadataConfig = new CredentialMetadataHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await credentialMetadataConfig.processRequest(request);
```

#### Credential Single Parse (`/handler/credential-single-parse/`)

```typescript
import { CredentialSingleParseHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/credential-single-parse';

const credentialParseConfig = new CredentialSingleParseHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await credentialParseConfig.processRequest(request);
```

#### Credential Single Issue (`/handler/credential-single-issue/`)

```typescript
import { CredentialSingleIssueHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/credential-single-issue';

const credentialIssueConfig = new CredentialSingleIssueHandlerConfigurationImpl(
  {
    extractorConfiguration,
    baseCredentialHandlerConfiguration,
    introspectionHandlerConfiguration,
    serverHandlerConfiguration,
    credentialSingleParseHandlerConfiguration,
    commonCredentialHandlerConfiguration,
  }
);

// Usage example
const response = await credentialIssueConfig.processRequest(request);
```

#### Credential Issuer JWKS (`/handler/credential-issuer-jwks/`)

```typescript
import { CredentialIssuerJwksHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/credential-issuer-jwks';

const credentialJwksConfig = new CredentialIssuerJwksHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await credentialJwksConfig.processRequest(request);
```

### Service Configuration Endpoints

#### Service Configuration (`/handler/service-configuration/`)

```typescript
import { ServiceConfigurationHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/service-configuration';

const serviceConfig = new ServiceConfigurationHandlerConfigurationImpl(
  serverConfig
);

// Usage example
const response = await serviceConfig.processRequest(request);
```

#### Service JWKS (`/handler/service-jwks/`)

```typescript
import { ServiceJwksHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/service-jwks';

const serviceJwksConfig = new ServiceJwksHandlerConfigurationImpl(serverConfig);

// Usage example
const response = await serviceJwksConfig.processRequest(request);
```

## Common Configuration

### ServerHandlerConfiguration

Server configuration used by all endpoints:

```typescript
import { ServerHandlerConfigurationImpl } from '@vecrea/au3te-ts-server/handler/core';
import { ApiClientImpl } from '@vecrea/au3te-ts-server/api';
import {
  KeyedSession,
  defaultSessionSchemas,
} from '@vecrea/au3te-ts-server/session';

const apiClient = new ApiClientImpl(authleteConfig);
const session = new KeyedSession(defaultSessionSchemas);

const serverConfig = new ServerHandlerConfigurationImpl(apiClient, session);
```

### ExtractorConfiguration

Configuration for extracting request parameters:

```typescript
import { ExtractorConfigurationImpl } from '@vecrea/au3te-ts-server/extractor';

const extractorConfig = new ExtractorConfigurationImpl({
  // extraction configuration
});
```

## Response Handling

`processRequest()` returns a standard Web API `Response` object:

```typescript
const response = await handlerConfig.processRequest(request);

// Status code
console.log(response.status); // 200, 400, 401, etc.

// Headers
response.headers.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// Body
const body = await response.text(); // or response.json()
```

## Error Handling

When an error occurs, an appropriate HTTP status code and error response is returned:

```typescript
try {
  const response = await handlerConfig.processRequest(request);
  // Handle normal response
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

## Customization

Each HandlerConfiguration can be customized as needed:

```typescript
// Create HandlerConfiguration with custom settings
const customTokenConfig = new TokenHandlerConfigurationImpl({
  serverHandlerConfiguration: serverConfig,
  userHandlerConfiguration: customUserConfig,
  // ... other custom configurations
});
```

## Architecture Benefits

The new structure with the `core` module provides several benefits:

- **Separation of Concerns**: Core functionality is separated from domain-specific handlers
- **Reusability**: Core components can be reused across different domains
- **Maintainability**: Easier to maintain and update core functionality
- **Testability**: Core functionality can be tested independently
- **Consistency**: Standardized patterns across all handlers
- **Extensibility**: Easy to add new handlers using the core infrastructure
