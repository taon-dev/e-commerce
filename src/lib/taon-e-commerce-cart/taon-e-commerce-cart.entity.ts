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
  //#region @websql
  @Column({ type: 'integer', nullable: true })
  //#endregion
  userId: number | null;

  //#region @websql
  @Column({ type: 'varchar', default: 'active' })
  //#endregion
  status: string;

  //#region @websql
  @Column({ type: 'varchar', default: 'EUR' })
  //#endregion
  currency: string;

  //#region @websql
  @Column({ type: 'datetime' })
  //#endregion
  createdAt: Date;

  //#region @websql
  @Column({ type: 'datetime' })
  //#endregion
  updatedAt: Date;
}
