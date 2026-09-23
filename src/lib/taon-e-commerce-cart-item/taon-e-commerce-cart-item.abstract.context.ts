//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
import { TaonECommerceCartItemController } from './taon-e-commerce-cart-item.controller';
import { TaonECommerceCartItemRepository } from './taon-e-commerce-cart-item.repository';
// import { TaonECommerceCartItemKvRepository } from './taon-e-commerce-cart-item.kv.repository';
import { TaonECommerceCartItemProvider } from './taon-e-commerce-cart-item.provider';
// import { TaonECommerceCartItemMiddleware } from './taon-e-commerce-cart-item.middleware';
// import { TaonECommerceCartItemSubscriber } from './taon-e-commerce-cart-item.subscriber';
//#endregion

export const TaonECommerceCartItemAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceCartItemAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceCartItemEntity },
  controllers: { TaonECommerceCartItemController },
  repositories: {
    // TaonECommerceCartItemKvRepository
    TaonECommerceCartItemRepository,
  },
  providers: { TaonECommerceCartItemProvider },
  // middlewares: { TaonECommerceCartItemMiddleware },
  // subscribers: { TaonECommerceCartItemSubscriber },
}));