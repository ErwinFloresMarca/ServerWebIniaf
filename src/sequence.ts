// autentication
import {AuthenticateFn, AuthenticationBindings} from '@loopback/authentication';
import {config, inject} from '@loopback/context';
import {InvokeMiddleware, InvokeMiddlewareOptions} from '@loopback/express';
import {
  FindRoute,
  InvokeMethod,
  MiddlewareSequence,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.INVOKE_MIDDLEWARE)
    readonly invokeMiddleware: InvokeMiddleware,
    @config()
    readonly options: InvokeMiddlewareOptions = MiddlewareSequence.defaultOptions,
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}
  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Headers', '*');
      response.header(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      );
      response.header('Access-Control-Max-Age', '86400');

      if (request.method === 'OPTIONS') {
        response.status(200);
        this.send(response, 'ok');
      } else {
        // await this.invokeMiddleware(context, this.options);
        const route = this.findRoute(request);
        const args = await this.parseParams(request, route);
        //add authentication actions
        await this.authenticateRequest(request);

        const result = await this.invoke(route, args);
        this.send(response, result);
      }
    } catch (err) {
      const CastError = err as {code: string};
      if (
        CastError.code === 'AUTHENTICATION_STRATEGY_NOT_FOUND' ||
        CastError.code === 'USER_PROFILE_NOT_FOUND'
      ) {
        Object.assign(CastError, {statusCode: 401 /* Unauthorized */});
      }
      this.reject(context, err as Error);
      return;
    }
  }
}
