import { describe, it, expect } from 'vitest';
import { defaultExtractPathParameter } from '../extractPathParameter';

describe('defaultExtractPathParameter', () => {
  it('should extract path parameter from URL', () => {
    const request = new Request('https://example.com/api/federation/initiation/fed1');
    const pattern = '/api/federation/initiation/:federationId';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({ federationId: 'fed1' });
  });

  it('should extract multiple path parameters', () => {
    const request = new Request('https://example.com/api/users/123/posts/456');
    const pattern = '/api/users/:userId/posts/:postId';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({ userId: '123', postId: '456' });
  });

  it('should handle path with no parameters', () => {
    const request = new Request('https://example.com/api/health');
    const pattern = '/api/health';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({});
  });

  it('should handle path with trailing slash', () => {
    const request = new Request('https://example.com/api/federation/callback/fed1/');
    const pattern = '/api/federation/callback/:federationId';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({ federationId: 'fed1' });
  });

  it('should extract parameter from root path', () => {
    const request = new Request('https://example.com/test');
    const pattern = '/:param';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({ param: 'test' });
  });

  it('should handle empty path segments', () => {
    const request = new Request('https://example.com/api//test');
    const pattern = '/api/:id/test';

    const result = defaultExtractPathParameter(request, pattern);

    expect(result).toEqual({ id: '' });
  });
});

