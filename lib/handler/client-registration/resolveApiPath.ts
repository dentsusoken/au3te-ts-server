/**
 * The API method used for the client registration request.
 */
export type ApiMethod = 'get' | 'create' | 'update' | 'delete';

/**
 * Parameters for resolving the API path.
 */
export interface ResolveApiPathParams {
  /**
   * The HTTP method used.
   */
  method: ApiMethod;

  /**
   * The base path for the client registration API.
   */
  basePath: string;
}

/**
 * Resolves the specific API path based on the HTTP method and base path.
 *
 * @param {ResolveApiPathParams} params - The parameters for resolving the path.
 * @returns {string} The resolved API path.
 */
export const resolveApiPath = ({ method, basePath }: ResolveApiPathParams) => {
  switch (method) {
    case 'get':
      return `${basePath}/get`;
    case 'create':
      return `${basePath}`;
    case 'update':
      return `${basePath}/update`;
    case 'delete':
      return `${basePath}/delete`;
  }
};
