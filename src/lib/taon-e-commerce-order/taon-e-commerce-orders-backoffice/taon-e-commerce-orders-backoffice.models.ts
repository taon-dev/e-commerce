import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export namespace TaonECommerceOrdersBackofficeModels {
  export const statusLabels = (component: object): Record<string, () => string> => {
    const translation = t.for(component);
    return {
      pending: translation.signal.gettext('Pending'),
      paid: translation.signal.gettext('Paid'),
      cancelled: translation.signal.gettext('Cancelled'),
      failed: translation.signal.gettext('Failed'),
      refunded: translation.signal.gettext('Refunded'),
    };
  };
}