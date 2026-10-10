//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
import { TaonECommerceOrderItemController } from './taon-e-commerce-order-item.controller';
import { TaonECommerceOrderItemRepository } from './taon-e-commerce-order-item.repository';
// import { TaonECommerceOrderItemKvRepository } from './taon-e-commerce-order-item.kv.repository';
import { TaonECommerceOrderItemProvider } from './taon-e-commerce-order-item.provider';
// import { TaonECommerceOrderItemMiddleware } from './taon-e-commerce-order-item.middleware';
// import { TaonECommerceOrderItemSubscriber } from './taon-e-commerce-order-item.subscriber';
//#endregion

export const TaonECommerceOrderItemAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceOrderItemAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceOrderItemEntity },
  controllers: { TaonECommerceOrderItemController },
  repositories: {
    // TaonECommerceOrderItemKvRepository
    TaonECommerceOrderItemRepository,
  },
  providers: { TaonECommerceOrderItemProvider },
  // middlewares: { TaonECommerceOrderItemMiddleware },
  // subscribers: { TaonECommerceOrderItemSubscriber },
}));