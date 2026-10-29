import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export namespace TaonECommercePaymentTransactionsBackofficeModels {
  export const statusLabels = (component: object): Record<string, () => string> => {
    const translation = t.for(component);
    return {
      pending: translation.signal.gettext('Pending'),
      succeeded: translation.signal.gettext('Succeeded'),
      failed: translation.signal.gettext('Failed'),
      cancelled: translation.signal.gettext('Cancelled'),
      refunded: translation.signal.gettext('Refunded'),
    };
  };

  export const providerLabels = (component: object): Record<string, () => string> => {
    const translation = t.for(component);
    return {
      stripe: translation.signal.gettext('Stripe'),
    };
  };
}