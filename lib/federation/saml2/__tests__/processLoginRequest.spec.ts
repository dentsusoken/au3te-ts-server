import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProcessLoginRequest, PostRequest, RedirectRequest } from '../processLoginRequest';
import { Saml2Configuration } from '../Saml2Configuration';
import * as samlify from 'samlify';

// Mock samlify
vi.mock('samlify', () => {
  const mockEntityMeta = {
    getAssertionConsumerService: vi.fn(),
  };

  const mockSp = {
    entityMeta: mockEntityMeta,
    createLoginRequest: vi.fn(),
  };

  return {
    default: {
      IdentityProvider: vi.fn().mockReturnValue({}),
      ServiceProvider: vi.fn().mockReturnValue(mockSp),
    },
  };
});

describe('createProcessLoginRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProcessLoginRequest', () => {
    // Given: Configuration with simpleSign binding
    // When: Creating login request
    // Then: Returns POST request with simpleSign binding
    it('should create POST request when simpleSign binding is available', async () => {
      const mockIdp = {} as samlify.IdentityProviderInstance;
      const mockEntityMeta = {
        getAssertionConsumerService: vi.fn((binding: string) => {
          if (binding === 'simpleSign') {
            return { location: 'https://sp.example.com/acs' };
          }
          return null;
        }),
      };
      const mockSp = {
        entityMeta: mockEntityMeta,
        createLoginRequest: vi.fn().mockReturnValue({
          entityEndpoint: 'https://idp.example.com/login',
          context: 'saml-request-context',
          relayState: 'relay-state-123',
        }),
      } as any;

      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue(mockIdp),
        getSp: vi.fn().mockResolvedValue(mockSp),
      };

      const processLoginRequest = createProcessLoginRequest(config);
      const result = await processLoginRequest();

      expect(result.type).toBe('post');
      expect((result as PostRequest).html).toContain(
        'https://idp.example.com/login'
      );
      expect((result as PostRequest).html).toContain('saml-request-context');
      expect((result as PostRequest).html).toContain('relay-state-123');
      expect(mockSp.createLoginRequest).toHaveBeenCalledWith(mockIdp, 'post');
    });

    // Given: Configuration with POST binding (no simpleSign)
    // When: Creating login request
    // Then: Returns POST request with POST binding
    it('should create POST request when POST binding is available (no simpleSign)', async () => {
      const mockIdp = {} as samlify.IdentityProviderInstance;
      const mockEntityMeta = {
        getAssertionConsumerService: vi.fn((binding: string) => {
          if (binding === 'post') {
            return { location: 'https://sp.example.com/acs' };
          }
          return null;
        }),
      };
      const mockSp = {
        entityMeta: mockEntityMeta,
        createLoginRequest: vi.fn().mockReturnValue({
          entityEndpoint: 'https://idp.example.com/login',
          context: 'saml-request-context',
          relayState: null,
        }),
      } as any;

      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue(mockIdp),
        getSp: vi.fn().mockResolvedValue(mockSp),
      };

      const processLoginRequest = createProcessLoginRequest(config);
      const result = await processLoginRequest();

      expect(result.type).toBe('post');
      expect((result as PostRequest).html).toContain('https://idp.example.com/login');
      expect((result as PostRequest).html).toContain('saml-request-context');
      expect((result as PostRequest).html).not.toContain('RelayState');
      expect(mockSp.createLoginRequest).toHaveBeenCalledWith(mockIdp, 'post');
    });

    // Given: Configuration with redirect binding only
    // When: Creating login request
    // Then: Returns redirect request
    it('should create redirect request when only redirect binding is available', async () => {
      const mockIdp = {} as samlify.IdentityProviderInstance;
      const mockEntityMeta = {
        getAssertionConsumerService: vi.fn((binding: string) => {
          if (binding === 'redirect') {
            return { location: 'https://sp.example.com/acs' };
          }
          return null;
        }),
      };
      const mockSp = {
        entityMeta: mockEntityMeta,
        createLoginRequest: vi.fn().mockReturnValue({
          context: 'https://idp.example.com/login?SAMLRequest=saml-request',
        }),
      } as any;

      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue(mockIdp),
        getSp: vi.fn().mockResolvedValue(mockSp),
      };

      const processLoginRequest = createProcessLoginRequest(config);
      const result = await processLoginRequest();

      expect(result.type).toBe('redirect');
      expect((result as RedirectRequest).location).toBe(
        'https://idp.example.com/login?SAMLRequest=saml-request'
      );
      expect(mockSp.createLoginRequest).toHaveBeenCalledWith(
        mockIdp,
        'redirect'
      );
    });

    // Given: Configuration with no supported bindings
    // When: Creating login request
    // Then: Throws TypeError
    it('should throw TypeError when no supported bindings are available', async () => {
      const mockIdp = {} as samlify.IdentityProviderInstance;
      const mockEntityMeta = {
        getAssertionConsumerService: vi.fn().mockReturnValue(null),
      };
      const mockSp = {
        entityMeta: mockEntityMeta,
      } as any;

      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue(mockIdp),
        getSp: vi.fn().mockResolvedValue(mockSp),
      };

      const processLoginRequest = createProcessLoginRequest(config);

      await expect(processLoginRequest()).rejects.toThrow('Not Supported');
    });

    // Given: Configuration
    // When: getIdp fails
    // Then: Error is propagated
    it('should propagate error when getIdp fails', async () => {
      const config: Saml2Configuration = {
        getIdp: vi.fn().mockRejectedValue(new Error('IdP error')),
        getSp: vi.fn().mockResolvedValue({}),
      };

      const processLoginRequest = createProcessLoginRequest(config);

      await expect(processLoginRequest()).rejects.toThrow('IdP error');
    });

    // Given: Configuration
    // When: getSp fails
    // Then: Error is propagated
    it('should propagate error when getSp fails', async () => {
      const config: Saml2Configuration = {
        getIdp: vi.fn().mockResolvedValue({}),
        getSp: vi.fn().mockRejectedValue(new Error('SP error')),
      };

      const processLoginRequest = createProcessLoginRequest(config);

      await expect(processLoginRequest()).rejects.toThrow('SP error');
    });
  });
});
