import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
// authentication
import {
  AuthCredential,
  AuthUser,
  CredentialsRequestBody,
  JWTService,
  MyAuthBindings,
  PasswordHasher,
  PasswordHasherBindings,
  PermissionKey,
} from '../authorization';
import {User} from '../models';
import {UserRepository} from '../repositories';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<AuthUser>,
  ) {}

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    user.permissions = [
      PermissionKey.CreateUser,
      PermissionKey.DeleteUser,
      PermissionKey.UpdateUser,
      PermissionKey.ViewUser,
    ];
    let foundUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (foundUser) {
      throw new HttpErrors.UnprocessableEntity('email was used');
    }
    foundUser = await this.userRepository.findOne({
      where: {name: user.name},
    });

    if (foundUser) {
      throw new HttpErrors.UnprocessableEntity('user name was used');
    }

    if (user.password) {
      const password = await this.passwordHasher.hashPassword(user.password);
      user.password = password;
    } else {
      throw new HttpErrors.UnprocessableEntity('password is not null');
    }

    const resUser = await this.userRepository.create(user);
    delete resUser.password;
    return resUser;
  }

  @post('/users/login')
  @response(200, {
    description: 'Token',
    content: {},
  })
  async login(
    @requestBody(CredentialsRequestBody) credential: AuthCredential,
  ): Promise<{token: string}> {
    const token = await this.jwtService.getToken(credential);
    return {token};
  }

  @get('/users/auth')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ViewUser],
    },
  })
  async findUserByToken(): Promise<User> {
    const user: AuthUser = await this.getCurrentUser();
    const resUser = await this.userRepository.findById(user.id);
    delete resUser.password;
    return resUser;
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ViewUser],
    },
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ViewUser],
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    const arrResponse = await this.userRepository.find(filter);
    arrResponse.forEach(user => {
      delete user.password;
    });
    return arrResponse;
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ViewUser],
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const resUser = await this.userRepository.findById(id, filter);
    delete resUser.password;
    return resUser;
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.UpdateUser],
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    let foundUser = await this.userRepository.findOne({
      where: {email: user.email},
    });

    if (foundUser && foundUser.id !== id) {
      throw new HttpErrors.UnprocessableEntity('email was used');
    }
    foundUser = await this.userRepository.findOne({
      where: {name: user.name},
    });

    if (foundUser && foundUser.id !== id) {
      throw new HttpErrors.UnprocessableEntity('user name was used');
    }

    if (user.password) {
      const password = await this.passwordHasher.hashPassword(user.password);
      user.password = password;
    } else {
      throw new HttpErrors.UnprocessableEntity('password is not null');
    }
    await this.userRepository.updateById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.DeleteUser],
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const currentUser = await this.getCurrentUser();
    if (id !== currentUser.id) {
      await this.userRepository.deleteById(id);
    } else {
      throw new HttpErrors.Unauthorized();
    }
  }
}
