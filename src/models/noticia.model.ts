import {Entity, model, property} from '@loopback/repository';

@model()
export class Noticia extends Entity {
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
  titulo: string;

  @property({
    type: 'string',
    required: true,
  })
  desc: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  fechaRegistro?: string;

  constructor(data?: Partial<Noticia>) {
    super(data);
  }
}

export interface NoticiaRelations {
  // describe navigational properties here
}

export type NoticiaWithRelations = Noticia & NoticiaRelations;
