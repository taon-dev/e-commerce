import type { TaonECommerceProductPermissionEntity } from './taon-e-commerce-product-permission.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonECommerceProductPermissionDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonECommerceProductPermissionEntity>;

export enum TaonECommerceProductPermissionErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonECommerceProductPermissionTranslationErorsMap = new Map([
  [TaonECommerceProductPermissionErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);