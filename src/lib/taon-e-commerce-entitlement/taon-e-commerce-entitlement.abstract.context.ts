import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceEntitlementEntity } from './taon-e-commerce-entitlement.entity';

export const TaonECommerceEntitlementAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceEntitlementAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonECommerceEntitlementEntity },
}));
