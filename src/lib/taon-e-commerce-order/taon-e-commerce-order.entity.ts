//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceOrderDefaultsValues } from './taon-e-commerce-order.constants';
//#endregion

@TaonEntity<TaonECommerceOrderEntity>({
  className: 'TaonECommerceOrderEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommerceOrderEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommerceOrderEntity extends TaonBaseAbstractEntity<TaonECommerceOrderEntity> {
  // TODO
}
