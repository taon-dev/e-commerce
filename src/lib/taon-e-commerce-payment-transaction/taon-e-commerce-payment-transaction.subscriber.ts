//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
import { TaonECommercePaymentTransactionProvider } from './taon-e-commerce-payment-transaction.provider';
//#endregion

@TaonSubscriber<TaonECommercePaymentTransactionSubscriber>({
  className: 'TaonECommercePaymentTransactionSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonECommercePaymentTransactionSubscriber extends TaonBaseSubscriberForEntity {
  private readonly taonECommercePaymentTransactionProvider = this.injectProvider(TaonECommercePaymentTransactionProvider);
  listenTo(): typeof TaonECommercePaymentTransactionEntity {
    return TaonECommercePaymentTransactionEntity;
  }
}