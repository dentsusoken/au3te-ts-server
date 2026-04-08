import { CommonHandlerConfigurationImpl } from '@vecrea/au3te-ts-common/handler';
import { ServerHandlerConfiguration } from './ServerHandlerConfiguration';
import {
  createRecoverResponseResult,
  RecoverResponseResult,
} from './recoverResponseResult';
import { Session } from '../../session/Session';
import type { DefaultSessionSchemas } from '../../session/sessionSchemas';
import { ApiClient } from '@vecrea/au3te-ts-common/api';
import { defaultPrepareHeaders, PrepareHeaders } from './prepareHeaders';
import { defaultResponseFactory, ResponseFactory } from './responseFactory';
import {
  createResponseErrorFactory,
  ResponseErrorFactory,
} from './responseErrorFactory';

/**
 * Implementation of the ServerHandlerConfiguration interface.
 * @template SS - Session schemas extending {@link DefaultSessionSchemas}.
 * @extends {CommonHandlerConfigurationImpl}
 * @implements {ServerHandlerConfiguration<SS>}
 */
export class ServerHandlerConfigurationImpl<SS extends DefaultSessionSchemas>
  extends CommonHandlerConfigurationImpl
  implements ServerHandlerConfiguration<SS>
{
  /** The API client used for making requests. */
  apiClient: ApiClient;

  /** The session object for managing user sessions. */
  session: Session<SS>;

  /** The response factory for creating responses. */
  responseFactory: ResponseFactory;

  /** The response error factory for creating response errors. */
  responseErrorFactory: ResponseErrorFactory;

  /** Function to recover from response errors. */
  recoverResponseResult: RecoverResponseResult;

  /** Function to prepare response headers. */
  prepareHeaders: PrepareHeaders;

  /**
   * Creates an instance of BaseHandlerConfigurationImpl.
   * @param {ApiClient} apiClient - The API client to use.
   * @param {Session<SS>} session - The session object to use.
   */
  constructor(apiClient: ApiClient, session: Session<SS>) {
    super();
    this.apiClient = apiClient;
    this.session = session;
    this.responseFactory = defaultResponseFactory;
    this.responseErrorFactory = createResponseErrorFactory(
      this.responseFactory
    );
    this.recoverResponseResult = createRecoverResponseResult({
      processError: this.processError,
      responseFactory: this.responseFactory,
    });
    this.prepareHeaders = defaultPrepareHeaders;
  }
}
