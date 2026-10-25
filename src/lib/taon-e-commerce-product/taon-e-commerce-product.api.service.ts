//#region imports
import { Injectable } from '@angular/core';
import { TaonCmsContentController } from '@taon-dev/cms/src';
import { TaonGroupController } from '@taon-dev/session/src';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonCartConfig } from '../index';
import { TaonECommerceCustomerController } from '../taon-e-commerce-customer/taon-e-commerce-customer.controller';
import type { TaonStripeSyncResult } from '../taon-stripe/taon-stripe.models';

import { TaonECommerceProductController } from './taon-e-commerce-product.controller';
import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

//#region models
export interface TaonECommerceStripeConfiguration {
  connected: boolean;
  message: string;
  webhookUrl: string;
}
//#endregion

@Injectable()
export class TaonECommerceProductApiService extends TaonBaseAngularService {
  public readonly taonECommerceProductController = this.injectController(
    TaonECommerceProductController,
  );

  private readonly customerController = this.injectController(
    TaonECommerceCustomerController,
  );

  readonly cmsContentController = this.injectController(TaonCmsContentController);

  readonly groupController = this.injectController(TaonGroupController);

  public getAllProductForUser(): Observable<TaonCartConfig> {
    return this.customerController.getBuyProducts()
      .request!().observable.pipe(
      map(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.responseText || 'Unable to load products.');
        }
        const products = res.body?.json;
        if (!Array.isArray(products)) {
          throw new Error('The available products response was invalid.');
        }
        return { suggestedProducts: products };
      }),
    );
  }

  public async getStripeConfiguration(): Promise<TaonECommerceStripeConfiguration> {
    const response =
      await this.taonECommerceProductController.getStripeConfiguration()
        .request!();
    if (response.statusCode >= 400 || !response.body?.json) {
      throw new Error(response.responseText || 'Unable to check Stripe status.');
    }
    return response.body.json;
  }

  public async syncWithStripe(syncId: string): Promise<TaonStripeSyncResult[]> {
    const response =
      await this.taonECommerceProductController
        .syncWithStripe(syncId)
        .request!();

    if (response.statusCode >= 400 || !Array.isArray(response.body?.json)) {
      throw new Error(
        response.responseText ||
          'Stripe synchronization could not be completed.',
      );
    }
    return response.body.json;
  }
}
