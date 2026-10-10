//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
import { TaonECommerceCustomerAddressController } from './taon-e-commerce-customer-address.controller';
import { TaonECommerceCustomerAddressRepository } from './taon-e-commerce-customer-address.repository';
// import { TaonECommerceCustomerAddressKvRepository } from './taon-e-commerce-customer-address.kv.repository';
import { TaonECommerceCustomerAddressProvider } from './taon-e-commerce-customer-address.provider';
// import { TaonECommerceCustomerAddressMiddleware } from './taon-e-commerce-customer-address.middleware';
// import { TaonECommerceCustomerAddressSubscriber } from './taon-e-commerce-customer-address.subscriber';
//#endregion

export const TaonECommerceCustomerAddressAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceCustomerAddressAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceCustomerAddressEntity },
  controllers: { TaonECommerceCustomerAddressController },
  repositories: {
    // TaonECommerceCustomerAddressKvRepository
    TaonECommerceCustomerAddressRepository,
  },
  providers: { TaonECommerceCustomerAddressProvider },
  // middlewares: { TaonECommerceCustomerAddressMiddleware },
  // subscribers: { TaonECommerceCustomerAddressSubscriber },
}));