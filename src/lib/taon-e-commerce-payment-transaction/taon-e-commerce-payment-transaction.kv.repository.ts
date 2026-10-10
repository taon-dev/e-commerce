//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
//#endregion

@TaonRepository({
  className: 'TaonECommercePaymentTransactionKvRepository',
})
export class TaonECommercePaymentTransactionKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonECommercePaymentTransactionEntity[];
}> {
  async notifyUsers(users: TaonECommercePaymentTransactionEntity[]) {
    this.set('usersToNotify', users);
  }
}