//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceProductPermissionDefaultsValues } from './taon-e-commerce-product-permission.constants';
//#endregion

@TaonEntity<TaonECommerceProductPermissionEntity>({
  className: 'TaonECommerceProductPermissionEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommerceProductPermissionEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommerceProductPermissionEntity extends TaonBaseAbstractEntity<TaonECommerceProductPermissionEntity> {
  // TODO
}
