//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
import { TaonECommerceProductPermissionController } from './taon-e-commerce-product-permission.controller';
import { TaonECommerceProductPermissionRepository } from './taon-e-commerce-product-permission.repository';
// import { TaonECommerceProductPermissionKvRepository } from './taon-e-commerce-product-permission.kv.repository';
import { TaonECommerceProductPermissionProvider } from './taon-e-commerce-product-permission.provider';
// import { TaonECommerceProductPermissionMiddleware } from './taon-e-commerce-product-permission.middleware';
// import { TaonECommerceProductPermissionSubscriber } from './taon-e-commerce-product-permission.subscriber';
//#endregion

export const TaonECommerceProductPermissionAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceProductPermissionAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceProductPermissionEntity },
  controllers: { TaonECommerceProductPermissionController },
  repositories: {
    // TaonECommerceProductPermissionKvRepository
    TaonECommerceProductPermissionRepository,
  },
  providers: { TaonECommerceProductPermissionProvider },
  // middlewares: { TaonECommerceProductPermissionMiddleware },
  // subscribers: { TaonECommerceProductPermissionSubscriber },
}));