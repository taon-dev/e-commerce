import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceProductDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceProductEntity>;

export enum TaonECommerceProductErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceProductTranslationErorsMap = new Map([
  [TaonECommerceProductErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);