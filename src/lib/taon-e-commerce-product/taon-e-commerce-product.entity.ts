//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceProductDefaultsValues } from './taon-e-commerce-product.constants';
//#endregion

@TaonEntity<TaonECommerceProductEntity>({
  className: 'TaonECommerceProductEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommerceProductEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommerceProductEntity extends TaonBaseAbstractEntity<TaonECommerceProductEntity> {
  // TODO
}
