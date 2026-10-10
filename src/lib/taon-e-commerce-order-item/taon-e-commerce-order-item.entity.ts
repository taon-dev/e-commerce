//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceOrderItemDefaultsValues } from './taon-e-commerce-order-item.constants';
//#endregion

@TaonEntity<TaonECommerceOrderItemEntity>({
  className: 'TaonECommerceOrderItemEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommerceOrderItemEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommerceOrderItemEntity extends TaonBaseAbstractEntity<TaonECommerceOrderItemEntity> {
  //TODO
}
