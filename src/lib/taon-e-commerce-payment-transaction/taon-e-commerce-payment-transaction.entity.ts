//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonECommercePaymentTransactionDefaultsValues } from './taon-e-commerce-payment-transaction.constants';
//#endregion

@TaonEntity<TaonECommercePaymentTransactionEntity>({
  className: 'TaonECommercePaymentTransactionEntity',
  createTable: true,
  // defaultModelMapping: () => ({
  //   '': TaonECommercePaymentTransactionEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonECommercePaymentTransactionEntity extends TaonBaseAbstractEntity<TaonECommercePaymentTransactionEntity> {
   // TODO
}
