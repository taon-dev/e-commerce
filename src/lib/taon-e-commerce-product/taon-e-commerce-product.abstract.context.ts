//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductController } from './taon-e-commerce-product.controller';
import { TaonECommerceProductRepository } from './taon-e-commerce-product.repository';
// import { TaonECommerceProductKvRepository } from './taon-e-commerce-product.kv.repository';
import { TaonECommerceProductProvider } from './taon-e-commerce-product.provider';
// import { TaonECommerceProductMiddleware } from './taon-e-commerce-product.middleware';
// import { TaonECommerceProductSubscriber } from './taon-e-commerce-product.subscriber';
//#endregion

export const TaonECommerceProductAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceProductAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceProductEntity },
  controllers: { TaonECommerceProductController },
  repositories: {
    // TaonECommerceProductKvRepository
    TaonECommerceProductRepository,
  },
  providers: { TaonECommerceProductProvider },
  // middlewares: { TaonECommerceProductMiddleware },
  // subscribers: { TaonECommerceProductSubscriber },
}));