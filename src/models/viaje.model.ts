import {Entity, model, property} from '@loopback/repository';

@model()
export class Viaje extends Entity {
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
  destino: string;

  @property({
    type: 'string',
    required: true,
  })
  resumen: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  fechaRegistro?: string;

  @property({
    type: 'string',
    required: true,
  })
  fechaViaje: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  imagenes?: object[];

  constructor(data?: Partial<Viaje>) {
    super(data);
  }
}

export interface ViajeRelations {
  // describe navigational properties here
}

export type ViajeWithRelations = Viaje & ViajeRelations;
