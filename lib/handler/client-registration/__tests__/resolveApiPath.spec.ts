import { describe, it, expect } from 'vitest';
import { resolveApiPath } from '../resolveApiPath';

describe('resolveApiPath', () => {
  const basePath = '/api/client/registration';

  it('should return create path when method is create', () => {
    const result = resolveApiPath({ method: 'create', basePath });
    expect(result).toBe(basePath);
  });

  it('should return get path when method is get', () => {
    const result = resolveApiPath({ method: 'get', basePath });
    expect(result).toBe(`${basePath}/get`);
  });

  it('should return update path when method is update', () => {
    const result = resolveApiPath({ method: 'update', basePath });
    expect(result).toBe(`${basePath}/update`);
  });

  it('should return delete path when method is delete', () => {
    const result = resolveApiPath({ method: 'delete', basePath });
    expect(result).toBe(`${basePath}/delete`);
  });
});

