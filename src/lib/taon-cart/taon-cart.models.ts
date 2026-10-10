export namespace TaonCartModels {}
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

export interface TaonCartConfig {
  suggestedProducts?: TaonECommerceProductEntity[] | null;
  iconShortText?: string;
}
