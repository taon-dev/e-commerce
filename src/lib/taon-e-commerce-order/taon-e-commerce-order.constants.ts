import type { TaonECommerceOrderEntity } from './taon-e-commerce-order.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceOrderDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceOrderEntity>;

export enum TaonECommerceOrderErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceOrderTranslationErorsMap = new Map([
  [TaonECommerceOrderErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);