export namespace TaonCartModels {}
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

export interface TaonCartConfig {
  suggestedProducts?: TaonECommerceProductEntity[] | null;
  iconShortText?: string;
}

export const TaonCartCheckoutSuccessParam = 'taon_cart_success';
export const TaonCartCheckoutCancelParam = 'taon_cart_cancel';
