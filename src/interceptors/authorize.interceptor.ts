import {
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';
import {
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {Getter} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {
  AuthUser,
  MyAuthBindings,
  RequiredPermissions,
  UserPermissionsFn,
} from '../authorization';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', {tags: {name: 'authorize'}})
export class AuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    public metadata: AuthenticationMetadata,
    @inject(MyAuthBindings.USER_PERMISSIONS)
    protected checkPermissons: UserPermissionsFn,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<AuthUser>,
  ) {}

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    /* eslint-disable */
    if (!this.metadata) return await next();
    let requiredPermissions: RequiredPermissions;
    if (Array.isArray(this.metadata)) {
      requiredPermissions = this.metadata[0].options as RequiredPermissions;
    } else {
      requiredPermissions = this.metadata.options as RequiredPermissions;
    }
    /* eslint-enable */
    const result = await next();
    const user: AuthUser = await this.getCurrentUser();
    if (!this.checkPermissons(user.permissions, requiredPermissions)) {
      throw new HttpErrors.Forbidden('INVALID_ACCESS_PERMISSION');
    }
    return result;
  }
}
