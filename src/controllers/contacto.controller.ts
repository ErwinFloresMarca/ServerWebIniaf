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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {
  AuthUser,
  JWTService,
  MyAuthBindings,
  PermissionKey,
} from '../authorization';
import {Contactos} from '../models';
import {ContactosRepository} from '../repositories';

export class ContactoController {
  constructor(
    @repository(ContactosRepository)
    public contactosRepository: ContactosRepository,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<AuthUser>,
  ) {}

  @post('/contactos')
  @response(200, {
    description: 'Contactos model instance',
    content: {'application/json': {schema: getModelSchemaRef(Contactos)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contactos, {
            title: 'NewContactos',
            exclude: ['id'],
          }),
        },
      },
    })
    contactos: Omit<Contactos, 'id'>,
  ): Promise<Contactos> {
    return this.contactosRepository.create(contactos);
  }

  @get('/contactos/count')
  @response(200, {
    description: 'Contactos model count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async count(
    @param.where(Contactos) where?: Where<Contactos>,
  ): Promise<Count> {
    return this.contactosRepository.count(where);
  }

  @get('/contactos')
  @response(200, {
    description: 'Array of Contactos model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Contactos, {includeRelations: true}),
        },
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async find(
    @param.filter(Contactos) filter?: Filter<Contactos>,
  ): Promise<Contactos[]> {
    return this.contactosRepository.find(filter);
  }

  @patch('/contactos')
  @response(200, {
    description: 'Contactos PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contactos, {partial: true}),
        },
      },
    })
    contactos: Contactos,
    @param.where(Contactos) where?: Where<Contactos>,
  ): Promise<Count> {
    return this.contactosRepository.updateAll(contactos, where);
  }

  @get('/contactos/{id}')
  @response(200, {
    description: 'Contactos model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Contactos, {includeRelations: true}),
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Contactos, {exclude: 'where'})
    filter?: FilterExcludingWhere<Contactos>,
  ): Promise<Contactos> {
    return this.contactosRepository.findById(id, filter);
  }

  @patch('/contactos/{id}')
  @response(204, {
    description: 'Contactos PATCH success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Contactos, {partial: true}),
        },
      },
    })
    contactos: Contactos,
  ): Promise<void> {
    await this.contactosRepository.updateById(id, contactos);
  }

  @put('/contactos/{id}')
  @response(204, {
    description: 'Contactos PUT success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() contactos: Contactos,
  ): Promise<void> {
    await this.contactosRepository.replaceById(id, contactos);
  }

  @del('/contactos/{id}')
  @response(204, {
    description: 'Contactos DELETE success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageCotacto],
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.contactosRepository.deleteById(id);
  }
}
