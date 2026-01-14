# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Client Registration Support**: Added Client Registration API handler, configuration, and request/response processing.
- **Standard Introspection Support**: Implemented standard introspection handler and configuration.
- **Federation Enhancements**:
  - Implemented SAML2 federation support.
  - Added federation callback and initiation handlers.
  - Added `buildAuthenticationRequestScope` function.
  - Added `extractPathParameter` utility function.
- **Service Configuration**: Added Authorization and OpenID configuration handlers.
- **User Authentication**: Enhanced user authentication flow with caching capabilities.

### Changed

- **Refactoring**:
  - Restrict federation to OIDC protocol only in some contexts.
  - Renamed session schemas (e.g., `sessionSchemas` to `defaultSessionSchemas`) and federation-related types for consistency.
  - Moved OIDC-related federation packages to `federation/oidc`.
  - Migrated authorization to `HandleWithOptions` and added override support.
  - Made `OPTS` optional in core request processing logic.

### Fixed

- Fixed import errors and type consistency issues in federation handlers.
- Fixed bugs in federation implementation.
- Handled undefined options in `processApiResponse` for credential single issue.

## [0.1.4] - 2025-07-25

### Changed

- **Major refactoring of handler directory structure**:
  - Moved core functionality to `lib/handler/core/` module
  - Moved constants to `lib/handler/constants/index.ts` for consistency
  - Updated all import paths throughout the codebase to use new structure
  - Added `lib/handler/core/index.ts` with alphabetical exports for all core functionality

### Added

- **New core module structure** with 18 core files:
  - `handle.ts`, `handleWithOptions.ts` - Request handling utilities
  - `prepareHeaders.ts` - Header preparation utilities
  - `processApiRequest.ts`, `processApiRequestWithValidation.ts` - API request processing
  - `processApiResponse.ts` - API response processing
  - `validateApiResponse.ts` - API response validation
  - `recoverResponseResult.ts` - Response result recovery
  - `responseFactory.ts`, `responseErrorFactory.ts` - Response creation factories
  - `ResponseError.ts` - Error class for HTTP responses
  - `ServerHandlerConfiguration.ts`, `ServerHandlerConfigurationImpl.ts` - Base server configuration
  - `toApiRequest.ts`, `toClientAuthRequest.ts` - Request transformation utilities
  - `types.ts` - Common type definitions
- **Factory-based architecture** for HTTP responses and errors
- **Updated test files** to use new factory-based architecture with `responseErrorFactory`
- **Comprehensive documentation** in README.md reflecting new structure

### Fixed

- Fixed test failures in `introspection/validateApiResponse.spec.ts` by removing problematic mocks
- Updated all test files to use proper `ResponseError` expectations
- Fixed type mismatches in mock functions (e.g., `dpopNonce` accepting `null` values)
- Resolved import path issues after directory restructuring

### Technical Details

- **Improved architecture** with separation of core functionality from domain-specific handlers
- **Enhanced maintainability** through better code organization and responsibility separation
- **Increased reusability** of core components across different domains
- **Better testability** with independent core functionality testing
- **Consistent patterns** across all handlers using standardized core infrastructure

## [0.1.3] - 2025-07-11

### Changed

- Extracted `CREDENTIAL_SINGLE_ISSUE_PATH` constant in `CredentialSingleIssueHandlerConfigurationImpl` for better maintainability

## [0.1.2] - 2025-07-11

### Changed

- Refactored credential handler: renamed `BaseCredentialHandler` to `ServerCredentialHandler` and updated all references
- Updated implementation and tests for `ServerCredentialHandler`
- Refactored and updated related `HandlerConfigurationImpl` files (authorization, token, introspection, etc.)
- Defined API paths as `XXX_PATH` constants in `HandlerConfigurationImpl` and referenced them in path definitions
- Updated test files and `__tests__` directories accordingly
- Removed obsolete `BaseCredentialHandler` files
- Updated `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts` as needed

## [0.1.1] - 2025-07-09

### Changed

- Renamed `BaseHandlerConfiguration` and `BaseHandlerConfigurationImpl` to `ServerHandlerConfiguration` and `ServerHandlerConfigurationImpl` respectively
- Updated all handler configuration implementations to use `serverHandlerConfiguration` parameter instead of `baseHandlerConfiguration`
- Updated test configurations and mock objects to use the new naming convention
- Fixed all test files to use `mockServerConfig` instead of `mockBaseConfig`

### Fixed

- Resolved test failures caused by property name mismatches after the rename
- Updated `lib/testing/configurations.ts` to use correct property names
- Fixed constructor parameter names in all handler configuration implementations

## [0.1.0] - 2025-07-09

### Changed

- Renamed project from `au3te-ts-base` to `au3te-ts-server`
- Updated package name from `@vecrea/au3te-ts-base` to `@vecrea/au3te-ts-server`
- Updated all GitHub repository URLs to reflect new project name
- Updated import statements in documentation to use proper package imports instead of relative paths
- Updated library name in Vite configuration

### Added

- Initial release of au3te-ts-server
- OAuth 2.0 and OpenID Connect authorization server implementation
- Support for Verifiable Credential issuance (OpenID4VC)
- Modular handler architecture for easy customization
- Multiple OAuth 2.0 grant types support:
  - Authorization Code Grant
  - Resource Owner Password Credentials Grant
  - Token Exchange (RFC 8693)
  - JWT Bearer Token (RFC 7523)
- Comprehensive TypeScript support with full type definitions
- Session management with InMemorySession
- Request parameter extraction utilities
- API client for Authlete services integration

### Technical Details

- Built with Vite for optimal development and build experience
- Uses TypeScript for type safety and better developer experience
- Modular exports for selective importing of functionality
- Comprehensive test suite with Vitest
- Peer dependencies on `@vecrea/au3te-ts-common`, `@vecrea/oid4vc-core`, `u8a-utils`, and `zod`
