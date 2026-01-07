import { describe, it, expect } from 'vitest';
import { defaultExtractParameters } from '../extractParameters';

describe('defaultExtractParameters', () => {
  it('should extract parameters from JSON request', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'value' }),
    });

    const result = await defaultExtractParameters(request);

    expect(result).toBe('{"key":"value"}');
  });

  it('should extract parameters from JSON PUT request', async () => {
    const request = new Request('https://example.com', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'value' }),
    });

    const result = await defaultExtractParameters(request);

    expect(result).toBe('{"key":"value"}');
  });

  it('should extract parameters from form-urlencoded POST request', async () => {
    const data = { query: 'hello world', param: 'a&b=c' };
    const body = new URLSearchParams(data).toString();
    //console.log(body);

    const request = new Request('https://example.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const result = await defaultExtractParameters(request);

    expect(result).toBe(body);
  });

  it('should extract parameters from form-urlencoded GET request', async () => {
    const data = { query: 'hello world', param: 'a&b=c' };
    const query = new URLSearchParams(data).toString();
    const request = new Request(`https://example.com?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await defaultExtractParameters(request);

    expect(result).toBe(query);
  });

  it('should extract parameters from URL query string for GET requests with unsupported content type', async () => {
    const data = { query: 'hello world', param: 'a&b=c' };
    const query = new URLSearchParams(data).toString();
    const request = new Request(`https://example.com?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const result = await defaultExtractParameters(request);

    expect(result).toBe(query);
  });
});
