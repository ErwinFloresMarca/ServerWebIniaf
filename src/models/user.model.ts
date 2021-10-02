import {Entity, model, property} from '@loopback/repository';
import {PermissionKey} from '../authorization/permission-key';

@model({
  settings: {hidden: ['password']},
})
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    index: true,
  })
  name?: string;

  @property({
    type: 'string',
  })
  avatar?: string;

  @property({
    type: 'string',
    index: true,
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password?: string;

  @property.array(String)
  permissions: PermissionKey[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
