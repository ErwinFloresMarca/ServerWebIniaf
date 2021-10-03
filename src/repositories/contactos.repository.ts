import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Contactos, ContactosRelations} from '../models';

export class ContactosRepository extends DefaultCrudRepository<
  Contactos,
  typeof Contactos.prototype.id,
  ContactosRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Contactos, dataSource);
  }
}
