import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Noticia, NoticiaRelations} from '../models';

export class NoticiaRepository extends DefaultCrudRepository<
  Noticia,
  typeof Noticia.prototype.id,
  NoticiaRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Noticia, dataSource);
  }
}
