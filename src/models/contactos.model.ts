import {Entity, model, property} from '@loopback/repository';

@model()
export class Contactos extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  asunto: string;

  @property({
    type: 'string',
    required: true,
  })
  mensaje: string;

  @property({
    type: 'boolean',
    default: false,
  })
  visto?: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  fechaRegistro?: string;

  constructor(data?: Partial<Contactos>) {
    super(data);
  }
}

export interface ContactosRelations {
  // describe navigational properties here
}

export type ContactosWithRelations = Contactos & ContactosRelations;
