import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessSaml2Request } from '../processSaml2Request';
import { Saml2Federation } from '@/federation/saml2/Saml2Federation';
import { DefaultSessionSchemas, Session } from '@/session';
import { ResponseErrorFactory } from '../../core';
import { UserHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.user';
import { User } from '@vecrea/au3te-ts-common/schemas.common';

describe('createProcessSaml2Request', () => {
  const createMockDependencies = () => {
    const mockSession = {
      get: vi.fn(),
      getBatch: vi.fn(),
      set: vi.fn(),
      setBatch: vi.fn(),
      delete: vi.fn(),
      deleteBatch: vi.fn(),
      clear: vi.fn(),
    } as unknown as Session<DefaultSessionSchemas>;

    const mockUserHandler = {
      addUser: vi.fn(),
      cacheUserAttributes: vi.fn(),
    } as unknown as UserHandlerConfiguration<User>;

    const mockResponseErrorFactory: ResponseErrorFactory = {
      badRequestResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 400 }),
      })),
      internalServerErrorResponseError: vi.fn((message: string) => ({
        response: new Response(message, { status: 500 }),
      })),
    } as unknown as ResponseErrorFactory;

    const mockFederation: Saml2Federation = {
      id: 'test-saml2-federation',
      type: 'saml2',
      processSaml2Response: vi.fn(),
    } as unknown as Saml2Federation;

    return {
      mockSession,
      mockUserHandler,
      mockResponseErrorFactory,
      mockFederation,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful processing', () => {
    // Given: Valid session with authorizationPageModel
    // When: Processing SAML2 request
    // Then: Returns authorization page with user info
    it('should process SAML2 request successfully and return authorization page', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      const mockSaml2Response = {
        nameID: 'user123',
      };

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'authorizationPageModel') {
            return Promise.resolve({
              user: null,
            });
          }
          return Promise.resolve(null);
        }
      );

      (mockFederation.processSaml2Response as ReturnType<
        typeof vi.fn
      >).mockResolvedValue(mockSaml2Response);

      const processSaml2Request = createProcessSaml2Request({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processSaml2Request(request, mockFederation);

      expect(mockFederation.processSaml2Response).toHaveBeenCalledWith(request);
      expect(mockSession.setBatch).toHaveBeenCalledWith({
        user: expect.objectContaining({
          subject: 'user123@test-saml2-federation',
        }),
        authTime: expect.any(Number),
      });
      expect(mockUserHandler.addUser).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('error handling', () => {
    // Given: Session without authorizationPageModel
    // When: Processing SAML2 request
    // Then: Returns 400 error
    it('should return 400 when authorizationPageModel not found', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const processSaml2Request = createProcessSaml2Request({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processSaml2Request(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith('Authorization page model not found');
    });

    // Given: Federation response processing fails
    // When: Processing SAML2 request
    // Then: Returns 400 error
    it('should return 400 when federation response processing fails', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockImplementation(
        (key: keyof DefaultSessionSchemas) => {
          if (key === 'authorizationPageModel') {
            return Promise.resolve({
              user: null,
            });
          }
          return Promise.resolve(null);
        }
      );

      (mockFederation.processSaml2Response as ReturnType<
        typeof vi.fn
      >).mockRejectedValue(new Error('SAML2 processing error'));

      const processSaml2Request = createProcessSaml2Request({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processSaml2Request(request, mockFederation);

      expect(response.status).toBe(400);
      expect(
        mockResponseErrorFactory.badRequestResponseError
      ).toHaveBeenCalledWith(
        'Failed to process federation response: SAML2 processing error'
      );
    });

    // Given: Unexpected error occurs
    // When: Processing SAML2 request
    // Then: Returns 500 error
    it('should return 500 when unexpected error occurs', async () => {
      const {
        mockSession,
        mockUserHandler,
        mockResponseErrorFactory,
        mockFederation,
      } = createMockDependencies();

      (mockSession.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Unexpected error')
      );

      const processSaml2Request = createProcessSaml2Request({
        responseErrorFactory: mockResponseErrorFactory,
        session: mockSession,
        userHandler: mockUserHandler,
      });

      const request = new Request('https://example.com/callback');
      const response = await processSaml2Request(request, mockFederation);

      expect(response.status).toBe(500);
      expect(
        mockResponseErrorFactory.internalServerErrorResponseError
      ).toHaveBeenCalledWith('Unexpected error: Unexpected error');
    });
  });
});
