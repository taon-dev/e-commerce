//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
import { TaonECommerceCartController } from './taon-e-commerce-cart.controller';
import { TaonECommerceCartRepository } from './taon-e-commerce-cart.repository';
// import { TaonECommerceCartKvRepository } from './taon-e-commerce-cart.kv.repository';
import { TaonECommerceCartProvider } from './taon-e-commerce-cart.provider';
// import { TaonECommerceCartMiddleware } from './taon-e-commerce-cart.middleware';
// import { TaonECommerceCartSubscriber } from './taon-e-commerce-cart.subscriber';
//#endregion

export const TaonECommerceCartAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceCartAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceCartEntity },
  controllers: { TaonECommerceCartController },
  repositories: {
    // TaonECommerceCartKvRepository
    TaonECommerceCartRepository,
  },
  providers: { TaonECommerceCartProvider },
  // middlewares: { TaonECommerceCartMiddleware },
  // subscribers: { TaonECommerceCartSubscriber },
}));