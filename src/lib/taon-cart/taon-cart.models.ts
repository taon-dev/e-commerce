import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export namespace TaonCartModels {
  export const statusLabels = (component: object): Record<string, () => string> => {
    const translation = t.for(component);
    return {
      active: translation.signal.gettext('Active'),
      canceled: translation.signal.gettext('Canceled'),
      past_due: translation.signal.gettext('Past due'),
      unpaid: translation.signal.gettext('Unpaid'),
      incomplete: translation.signal.gettext('Incomplete'),
      paused: translation.signal.gettext('Paused'),
      expired: translation.signal.gettext('Expired'),
    };
  };
}
import type { TaonECommerceProductEntity } from '../taon-e-commerce-product/taon-e-commerce-product.entity';

export interface TaonCartConfig {
  suggestedProducts?: TaonECommerceProductEntity[] | null;
  iconShortText?: string;
}

export const TaonCartCheckoutSuccessParam = 'taon_cart_success';
export const TaonCartCheckoutCancelParam = 'taon_cart_cancel';
