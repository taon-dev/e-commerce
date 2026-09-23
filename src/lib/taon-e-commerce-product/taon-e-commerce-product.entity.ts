//#region imports
import {
  CustomColumn, Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommerceProductDefaultsValues } from './taon-e-commerce-product.constants';
//#endregion

@TaonEntity({
  className: 'TaonECommerceProductEntity',
  createTable: true,
})
export class TaonECommerceProductEntity extends TaonBaseAbstractEntity<TaonECommerceProductEntity> {
  //#region @websql
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: TaonECommerceProductDefaultsValues.description,
  })
  //#endregion
  description?: string;
}