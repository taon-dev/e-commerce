import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCartAbstractContext } from './taon-e-commerce-cart/taon-e-commerce-cart.abstract.context';
import { TaonECommerceCartItemAbstractContext } from './taon-e-commerce-cart-item/taon-e-commerce-cart-item.abstract.context';
import { TaonECommerceProductAbstractContext } from './taon-e-commerce-product/taon-e-commerce-product.abstract.context';

export const TaonECommerceAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceAbstractContext',
  abstract: true,
  contexts: {
    TaonECommerceCartAbstractContext,
    TaonECommerceCartItemAbstractContext,
    TaonECommerceProductAbstractContext,
  },
}));
