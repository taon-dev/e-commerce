import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCustomerController } from './taon-e-commerce-customer.controller';
import { TaonECommerceCustomerRepository } from './taon-e-commerce-customer.repository';

export const TaonECommerceCustomerAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceCustomerAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  controllers: { TaonECommerceCustomerController },
  repositories: { TaonECommerceCustomerRepository },
}));
