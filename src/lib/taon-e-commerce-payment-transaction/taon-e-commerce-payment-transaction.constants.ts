import type { TaonECommercePaymentTransactionEntity } from './taon-e-commerce-payment-transaction.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommercePaymentTransactionDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommercePaymentTransactionEntity>;

export enum TaonECommercePaymentTransactionErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommercePaymentTransactionTranslationErorsMap = new Map([
  [TaonECommercePaymentTransactionErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);