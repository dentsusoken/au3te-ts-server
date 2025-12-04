import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createGetServerMetadata } from '../getServerMetadata';
import { AuthorizationServer } from 'oauth4webapi';

// Mock oauth4webapi
vi.mock('oauth4webapi', async () => {
  const actual = await vi.importActual('oauth4webapi');
  return {
    ...actual,
    discoveryRequest: vi.fn(),
    processDiscoveryResponse: vi.fn(),
    allowInsecureRequests: Symbol('allowInsecureRequests'),
  };
});

describe('createGetServerMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached serverMetadata if available', async () => {
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
    } as AuthorizationServer;

    const issuer = () => new URL('https://example.com');
    const getServerMetadata = createGetServerMetadata(mockMetadata, issuer, false);

    const result = await getServerMetadata();

    expect(result).toBe(mockMetadata);
  });

  it('should fetch and return serverMetadata if not cached', async () => {
    const { discoveryRequest, processDiscoveryResponse } = await import('oauth4webapi');
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
    } as AuthorizationServer;

    const mockResponse = new Response(JSON.stringify(mockMetadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.mocked(discoveryRequest).mockResolvedValue(mockResponse);
    vi.mocked(processDiscoveryResponse).mockResolvedValue(mockMetadata);

    const issuer = () => new URL('https://example.com');
    const setServerMetadata = vi.fn();
    const getServerMetadata = createGetServerMetadata(undefined, issuer, false, setServerMetadata);

    const result = await getServerMetadata();

    expect(discoveryRequest).toHaveBeenCalledWith(
      new URL('https://example.com'),
      expect.any(Object)
    );
    expect(processDiscoveryResponse).toHaveBeenCalled();
    expect(setServerMetadata).toHaveBeenCalledWith(mockMetadata);
    expect(result).toEqual(mockMetadata);
  });

  it('should use isDev flag for allowInsecureRequests', async () => {
    const { discoveryRequest, processDiscoveryResponse, allowInsecureRequests } = await import('oauth4webapi');
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
    } as AuthorizationServer;

    const mockResponse = new Response(JSON.stringify(mockMetadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.mocked(discoveryRequest).mockResolvedValue(mockResponse);
    vi.mocked(processDiscoveryResponse).mockResolvedValue(mockMetadata);

    const issuer = () => new URL('https://example.com');
    const getServerMetadata = createGetServerMetadata(undefined, issuer, true);

    await getServerMetadata();

    expect(discoveryRequest).toHaveBeenCalledWith(
      new URL('https://example.com'),
      expect.objectContaining({
        [allowInsecureRequests]: true,
      })
    );
  });

  it('should pass through options to discoveryRequest', async () => {
    const { discoveryRequest, processDiscoveryResponse } = await import('oauth4webapi');
    const mockMetadata: AuthorizationServer = {
      issuer: 'https://example.com',
    } as AuthorizationServer;

    const mockResponse = new Response(JSON.stringify(mockMetadata), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.mocked(discoveryRequest).mockResolvedValue(mockResponse);
    vi.mocked(processDiscoveryResponse).mockResolvedValue(mockMetadata);

    const issuer = () => new URL('https://example.com');
    const getServerMetadata = createGetServerMetadata(undefined, issuer, false);

    const options = { signal: new AbortController().signal };
    await getServerMetadata(options);

    expect(discoveryRequest).toHaveBeenCalledWith(
      new URL('https://example.com'),
      expect.objectContaining(options)
    );
  });
});

