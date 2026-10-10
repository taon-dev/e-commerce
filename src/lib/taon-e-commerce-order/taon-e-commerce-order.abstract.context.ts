//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
import { TaonECommerceOrderController } from './taon-e-commerce-order.controller';
import { TaonECommerceOrderRepository } from './taon-e-commerce-order.repository';
// import { TaonECommerceOrderKvRepository } from './taon-e-commerce-order.kv.repository';
import { TaonECommerceOrderProvider } from './taon-e-commerce-order.provider';
// import { TaonECommerceOrderMiddleware } from './taon-e-commerce-order.middleware';
// import { TaonECommerceOrderSubscriber } from './taon-e-commerce-order.subscriber';
//#endregion

export const TaonECommerceOrderAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceOrderAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceOrderEntity },
  controllers: { TaonECommerceOrderController },
  repositories: {
    // TaonECommerceOrderKvRepository
    TaonECommerceOrderRepository,
  },
  providers: { TaonECommerceOrderProvider },
  // middlewares: { TaonECommerceOrderMiddleware },
  // subscribers: { TaonECommerceOrderSubscriber },
}));