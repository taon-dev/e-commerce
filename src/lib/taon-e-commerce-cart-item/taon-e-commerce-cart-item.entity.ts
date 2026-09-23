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
  //#region @websql
  @Column({ type: 'integer' })
  //#endregion
  cartId: number;

  //#region @websql
  @Column({ type: 'integer' })
  //#endregion
  productVariantId: number;

  //#region @websql
  @Column({ type: 'integer', default: 1 })
  //#endregion
  quantity: number;

  //#region @websql
  @Column({ type: 'integer' })
  //#endregion
  unitPrice: number;

  //#region @websql
  @Column({ type: 'datetime' })
  //#endregion
  createdAt: Date;
}
