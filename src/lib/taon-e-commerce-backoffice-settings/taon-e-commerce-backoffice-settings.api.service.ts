import { Injectable } from '@angular/core';
import { TaonBaseAngularService } from 'taon/src';

import { TaonECommerceBackofficeSettingsController } from './taon-e-commerce-backoffice-settings.controller';

@Injectable()
export class TaonECommerceBackofficeSettingsApiService extends TaonBaseAngularService {
  private readonly controller = this.injectController(
    TaonECommerceBackofficeSettingsController,
  );

  async getSellingEnabled(): Promise<boolean> {
    const response = await this.controller.getSellingEnabled().request!();
    const enabled = response.body?.json;

    if (response.statusCode >= 400 || typeof enabled !== 'boolean') {
      throw new Error(
        response.responseText || 'Unable to load the selling setting.',
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
        response.responseText || 'Unable to update the selling setting.',
      );
    }

    return saved;
  }
}
