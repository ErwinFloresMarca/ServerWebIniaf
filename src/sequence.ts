// autentication
import {AuthenticateFn, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
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
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      //add authentication actions
      await this.authenticateRequest(request);

      const result = await this.invoke(route, args);
      this.send(response, result);
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
