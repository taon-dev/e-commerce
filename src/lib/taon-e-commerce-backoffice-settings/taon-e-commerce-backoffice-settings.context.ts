import { createContext, TaonBaseContext } from 'taon/src';

import { TaonECommerceBackofficeSettingsController } from './taon-e-commerce-backoffice-settings.controller';
import { TaonECommerceSettingsKvRepository } from './taon-e-commerce-settings.kv.repository';

export const TaonECommerceBackofficeSettingsContext = createContext(() => ({
  contextName: 'TaonECommerceBackofficeSettingsContext',
  abstract: true,
  contexts: { TaonBaseContext },
  controllers: { TaonECommerceBackofficeSettingsController },
  repositories: { TaonECommerceSettingsKvRepository },
}));
