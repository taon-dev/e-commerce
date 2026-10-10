import {
  Body,
  GET,
  PUT,
  Taon,
  TaonBaseController,
  TaonController,
} from 'taon/src';

import { TaonECommerceSettingsKvRepository } from './taon-e-commerce-settings.kv.repository';

@TaonController({
  className: 'TaonECommerceBackofficeSettingsController',
})
export class TaonECommerceBackofficeSettingsController extends TaonBaseController {
  private readonly settings = this.injectCustomRepo(
    TaonECommerceSettingsKvRepository,
  );

  @GET()
  getSellingEnabled(): Taon.Response<boolean> {
    return async () => {
      return (await this.settings.get('sellingEnabled')) ?? true;
    };
  }

  @PUT()
  setSellingEnabled(@Body('enabled') enabled: boolean): Taon.Response<boolean> {
    return async () => {
      if (typeof enabled !== 'boolean') {
        throw new Error('Selling enabled must be a boolean.');
      }

      await this.settings.set('sellingEnabled', enabled);
      return enabled;
    };
  }
}
