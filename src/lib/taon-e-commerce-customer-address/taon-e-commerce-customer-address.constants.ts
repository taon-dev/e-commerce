import type { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceCustomerAddressDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceCustomerAddressEntity>;

export enum TaonECommerceCustomerAddressErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceCustomerAddressTranslationErorsMap = new Map([
  [TaonECommerceCustomerAddressErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);