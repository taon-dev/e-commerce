import type { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceOrderItemDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceOrderItemEntity>;

export enum TaonECommerceOrderItemErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceOrderItemTranslationErorsMap = new Map([
  [TaonECommerceOrderItemErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);