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
import {Noticia} from '../models';
import {NoticiaRepository} from '../repositories';

export class NoticiaController {
  constructor(
    @repository(NoticiaRepository)
    public noticiaRepository: NoticiaRepository,
    @inject(MyAuthBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<AuthUser>,
  ) {}

  @post('/noticias')
  @response(200, {
    description: 'Noticia model instance',
    content: {'application/json': {schema: getModelSchemaRef(Noticia)}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Noticia, {
            title: 'NewNoticia',
            exclude: ['id'],
          }),
        },
      },
    })
    noticia: Omit<Noticia, 'id'>,
  ): Promise<Noticia> {
    return this.noticiaRepository.create(noticia);
  }

  @get('/noticias/count')
  @response(200, {
    description: 'Noticia model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Noticia) where?: Where<Noticia>): Promise<Count> {
    return this.noticiaRepository.count(where);
  }

  @get('/noticias')
  @response(200, {
    description: 'Array of Noticia model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Noticia, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Noticia) filter?: Filter<Noticia>,
  ): Promise<Noticia[]> {
    return this.noticiaRepository.find(filter);
  }

  @patch('/noticias')
  @response(200, {
    description: 'Noticia PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Noticia, {partial: true}),
        },
      },
    })
    noticia: Noticia,
    @param.where(Noticia) where?: Where<Noticia>,
  ): Promise<Count> {
    return this.noticiaRepository.updateAll(noticia, where);
  }

  @get('/noticias/{id}')
  @response(200, {
    description: 'Noticia model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Noticia, {includeRelations: true}),
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Noticia, {exclude: 'where'})
    filter?: FilterExcludingWhere<Noticia>,
  ): Promise<Noticia> {
    return this.noticiaRepository.findById(id, filter);
  }

  @patch('/noticias/{id}')
  @response(204, {
    description: 'Noticia PATCH success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Noticia, {partial: true}),
        },
      },
    })
    noticia: Noticia,
  ): Promise<void> {
    await this.noticiaRepository.updateById(id, noticia);
  }

  @put('/noticias/{id}')
  @response(204, {
    description: 'Noticia PUT success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() noticia: Noticia,
  ): Promise<void> {
    await this.noticiaRepository.replaceById(id, noticia);
  }

  @del('/noticias/{id}')
  @response(204, {
    description: 'Noticia DELETE success',
  })
  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKey.ManageNoticias],
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.noticiaRepository.deleteById(id);
  }
}
