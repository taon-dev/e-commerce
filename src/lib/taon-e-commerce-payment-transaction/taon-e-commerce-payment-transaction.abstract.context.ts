//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
import { TaonECommercePaymentTransactionController } from './taon-e-commerce-payment-transaction.controller';
import { TaonECommercePaymentTransactionRepository } from './taon-e-commerce-payment-transaction.repository';
// import { TaonECommercePaymentTransactionKvRepository } from './taon-e-commerce-payment-transaction.kv.repository';
import { TaonECommercePaymentTransactionProvider } from './taon-e-commerce-payment-transaction.provider';
// import { TaonECommercePaymentTransactionMiddleware } from './taon-e-commerce-payment-transaction.middleware';
// import { TaonECommercePaymentTransactionSubscriber } from './taon-e-commerce-payment-transaction.subscriber';
//#endregion

export const TaonECommercePaymentTransactionAbstractContext = createContext(() => ({
  contextName: 'TaonECommercePaymentTransactionAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommercePaymentTransactionEntity },
  controllers: { TaonECommercePaymentTransactionController },
  repositories: {
    // TaonECommercePaymentTransactionKvRepository
    TaonECommercePaymentTransactionRepository,
  },
  providers: { TaonECommercePaymentTransactionProvider },
  // middlewares: { TaonECommercePaymentTransactionMiddleware },
  // subscribers: { TaonECommercePaymentTransactionSubscriber },
}));