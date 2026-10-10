//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceCartItemDefaultsValues } from './taon-e-commerce-cart-item.constants';
//#endregion

@TaonEntity({
  className: 'TaonECommerceCartItemEntity',
  createTable: true,
})
export class TaonECommerceCartItemEntity extends TaonBaseAbstractEntity<TaonECommerceCartItemEntity> {

  // TODO
}
