import type { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceCartItemDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceCartItemEntity>;

export enum TaonECommerceCartItemErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceCartItemTranslationErorsMap = new Map([
  [TaonECommerceCartItemErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);