import { Injectable } from '@angular/core';
import { Taon, TaonBaseAngularService } from 'taon/src';
import { Translation } from '@taon-dev/i18n/src';

import { TaonECommerceBackofficeSettingsController } from './taon-e-commerce-backoffice-settings.controller';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Injectable()
export class TaonECommerceBackofficeSettingsApiService extends TaonBaseAngularService {
  t = t.for(this);

  private readonly controller = this.injectController(
    TaonECommerceBackofficeSettingsController,
  );

  async getSellingEnabled(): Promise<boolean> {
    const response = await this.controller.getSellingEnabled().request!();
    const enabled = response.body?.json;

    if (response.statusCode >= 400 || typeof enabled !== 'boolean') {
      throw new Error(
        response.responseText || this.t.gettext('Unable to load the selling setting.'),
      );
    }

    return enabled;
  }

  async setSellingEnabled(enabled: boolean): Promise<boolean> {
    const response =
      await this.controller.setSellingEnabled(enabled).request!();
    const saved = response.body?.json;

    if (response.statusCode >= 400 || typeof saved !== 'boolean') {
      throw new Error(
        response.responseText || this.t.gettext('Unable to update the selling setting.'),
      );
    }

    return saved;
  }
}
