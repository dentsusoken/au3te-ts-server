import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createToApiRequest } from '../toApiRequest';
import { ExtractClientCredentials, ExtractParameters } from '@/extractor';
import { ResourceServerHandlerConfiguration } from '@vecrea/au3te-ts-common/handler.resourceServer';
import { ResourceServer } from '@vecrea/au3te-ts-common/schemas.common';

describe('createToApiRequest', () => {
  const mockExtractClientCredentials = vi.fn() as unknown as ExtractClientCredentials;
  const mockExtractParameters = vi.fn() as unknown as ExtractParameters;
  const mockResourceServerHandler = {
    get: vi.fn(),
    authenticate: vi.fn(),
  } as unknown as ResourceServerHandlerConfiguration;

  const toApiRequest = createToApiRequest({
    extractClientCredentials: mockExtractClientCredentials,
    extractParameters: mockExtractParameters,
    resourceServerHandler: mockResourceServerHandler,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a valid request object when authentication succeeds', async () => {
    const mockRequest = new Request('https://example.com/api/introspect', {
      headers: { Accept: 'application/json' },
    });
    const mockRs: ResourceServer = {
      id: 'rs1',
      authenticationType: 'BASIC',
      secret: 'secret',
      uri: 'https://rs.example.com',
      introspectionSignAlg: 'RS256',
    };

    (mockExtractClientCredentials as any).mockResolvedValue({
      clientId: 'rs1',
      clientSecret: 'secret',
    });
    (mockResourceServerHandler.get as any).mockResolvedValue(mockRs);
    (mockResourceServerHandler.authenticate as any).mockResolvedValue(true);
    (mockExtractParameters as any).mockResolvedValue('token=abc');

    const result = await toApiRequest(mockRequest);

    expect(result).toEqual({
      parameters: 'token=abc',
      httpAcceptHeader: 'application/json',
      rsUri: 'https://rs.example.com',
      introspectionSignAlg: 'RS256',
      introspectionEncryptionAlg: undefined,
      introspectionEncryptionEnc: undefined,
      publicKeyForEncryption: undefined,
      sharedKeyForSign: undefined,
      sharedKeyForEncryption: undefined,
    });
  });

  it('should throw error if resource server is not found', async () => {
    const mockRequest = new Request('https://example.com/api/introspect');
    (mockExtractClientCredentials as any).mockResolvedValue({
      clientId: 'rs1',
      clientSecret: 'secret',
    });
    (mockResourceServerHandler.get as any).mockResolvedValue(null);

    await expect(toApiRequest(mockRequest)).rejects.toThrow('Resource server not found');
  });

  it('should throw error if authentication fails', async () => {
    const mockRequest = new Request('https://example.com/api/introspect');
    const mockRs: ResourceServer = {
      id: 'rs1',
      authenticationType: 'BASIC',
      secret: 'secret',
      uri: 'https://rs.example.com',
    };

    (mockExtractClientCredentials as any).mockResolvedValue({
      clientId: 'rs1',
      clientSecret: 'secret',
    });
    (mockResourceServerHandler.get as any).mockResolvedValue(mockRs);
    (mockResourceServerHandler.authenticate as any).mockResolvedValue(false);

    await expect(toApiRequest(mockRequest)).rejects.toThrow('Resource server authentication failed');
  });
});

