import { TaonCmsAbstractContext } from '@taon-dev/cms/src';
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceCartAbstractContext } from './taon-e-commerce-cart/taon-e-commerce-cart.abstract.context';
import { TaonECommerceCartItemAbstractContext } from './taon-e-commerce-cart-item/taon-e-commerce-cart-item.abstract.context';
import { TaonECommerceCustomerAddressAbstractContext } from './taon-e-commerce-customer-address/taon-e-commerce-customer-address.abstract.context';
import { TaonECommerceOrderAbstractContext } from './taon-e-commerce-order/taon-e-commerce-order.abstract.context';
import { TaonECommerceOrderItemAbstractContext } from './taon-e-commerce-order-item/taon-e-commerce-order-item.abstract.context';
import { TaonECommercePaymentTransactionAbstractContext } from './taon-e-commerce-payment-transaction/taon-e-commerce-payment-transaction.abstract.context';
import { TaonECommerceProductAbstractContext } from './taon-e-commerce-product/taon-e-commerce-product.abstract.context';
import { TaonECommerceProductPermissionAbstractContext } from './taon-e-commerce-product-permission/taon-e-commerce-product-permission.abstract.context';

export const TaonECommerceAbstractContext = createContext(() => ({
  contextName: 'TaonECommerceAbstractContext',
  abstract: true,
  contexts: {
    TaonCmsAbstractContext,
    TaonECommerceCartAbstractContext,
    TaonECommerceCartItemAbstractContext,
    TaonECommerceCustomerAddressAbstractContext,
    TaonECommerceOrderAbstractContext,
    TaonECommerceOrderItemAbstractContext,
    TaonECommercePaymentTransactionAbstractContext,
    TaonECommerceProductAbstractContext,
    TaonECommerceProductPermissionAbstractContext,
  },
}));
