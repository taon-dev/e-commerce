//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
  PrimaryGeneratedColumn,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceCartDefaultsValues } from './taon-e-commerce-cart.constants';
//#endregion

@TaonEntity({
  className: 'TaonECommerceCartEntity',
  createTable: true,
})
export class TaonECommerceCartEntity extends TaonBaseAbstractEntity<TaonECommerceCartEntity> {
  // TODO
}
