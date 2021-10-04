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
import {Viaje} from '../models';
import {ViajeRepository} from '../repositories';

export class ViajeController {
  constructor(
    @repository(ViajeRepository)
    public viajeRepository: ViajeRepository,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<AuthUser>,
  ) {}

  @post('/viajes')
  @response(200, {
    description: 'Viaje model instance',
    content: {'application/json': {schema: getModelSchemaRef(Viaje)}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Viaje, {
            title: 'NewViaje',
            exclude: ['id'],
          }),
        },
      },
    })
    viaje: Omit<Viaje, 'id'>,
  ): Promise<Viaje> {
    return this.viajeRepository.create(viaje);
  }

  @get('/viajes/count')
  @response(200, {
    description: 'Viaje model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Viaje) where?: Where<Viaje>): Promise<Count> {
    return this.viajeRepository.count(where);
  }

  @get('/viajes')
  @response(200, {
    description: 'Array of Viaje model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Viaje, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Viaje) filter?: Filter<Viaje>): Promise<Viaje[]> {
    return this.viajeRepository.find(filter);
  }

  @patch('/viajes')
  @response(200, {
    description: 'Viaje PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Viaje, {partial: true}),
        },
      },
    })
    viaje: Viaje,
    @param.where(Viaje) where?: Where<Viaje>,
  ): Promise<Count> {
    return this.viajeRepository.updateAll(viaje, where);
  }

  @get('/viajes/{id}')
  @response(200, {
    description: 'Viaje model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Viaje, {includeRelations: true}),
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Viaje, {exclude: 'where'})
    filter?: FilterExcludingWhere<Viaje>,
  ): Promise<Viaje> {
    return this.viajeRepository.findById(id, filter);
  }

  @patch('/viajes/{id}')
  @response(204, {
    description: 'Viaje PATCH success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Viaje, {partial: true}),
        },
      },
    })
    viaje: Viaje,
  ): Promise<void> {
    await this.viajeRepository.updateById(id, viaje);
  }

  @put('/viajes/{id}')
  @response(204, {
    description: 'Viaje PUT success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() viaje: Viaje,
  ): Promise<void> {
    await this.viajeRepository.replaceById(id, viaje);
  }

  @del('/viajes/{id}')
  @response(204, {
    description: 'Viaje DELETE success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageUltimosViajes],
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.viajeRepository.deleteById(id);
  }
}
