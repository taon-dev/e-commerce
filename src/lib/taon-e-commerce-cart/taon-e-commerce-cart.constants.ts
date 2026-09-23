import type { TaonECommerceCartEntity } from './taon-e-commerce-cart.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceCartDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceCartEntity>;

export enum TaonECommerceCartErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceCartTranslationErorsMap = new Map([
  [TaonECommerceCartErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);