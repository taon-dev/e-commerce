//#region imports
import { Injectable } from '@angular/core';
import { Translation } from '@taon-dev/i18n/src';
import { TaonCmsContentController } from '@taon-dev/cms/src';
import { TaonGroupController } from '@taon-dev/session/src';
import { HttpResponse } from 'ng2-rest/src';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonCartConfig } from '../index';
import { TaonECommerceCustomerController } from '../taon-e-commerce-customer/taon-e-commerce-customer.controller';
import type { TaonStripeSyncResult } from '../taon-stripe/taon-stripe.models';

import { TaonECommerceProductController } from './taon-e-commerce-product.controller';
import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

//#region models
export interface TaonECommerceStripeConfiguration {
  connected: boolean;
  message: string;
  webhookUrl: string;
}
//#endregion

@Injectable()
export class TaonECommerceProductApiService extends TaonBaseAngularService {
  readonly t = t.for(this);

  protected readonly taonECommerceProductController = this.injectController(
    TaonECommerceProductController,
  );

  private readonly customerController = this.injectController(
    TaonECommerceCustomerController,
  );

  readonly cmsContentController = this.injectController(
    TaonCmsContentController,
  );

  readonly groupController = this.injectController(TaonGroupController);

  public get crudController(): TaonECommerceProductController {
    return this.taonECommerceProductController;
  }

  public getAllProductForUser(): Observable<TaonCartConfig> {
    return this.customerController.getBuyProducts().request!().observable.pipe(
      map(res => {
        if (res.statusCode >= 400) {
          throw new Error(res.responseText || this.t.gettext('Unable to load products.'));
        }
        const products = res.body?.json;
        if (!Array.isArray(products)) {
          throw new Error(this.t.gettext('The available products response was invalid.'));
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
      throw new Error(
        response.responseText || this.t.gettext('Unable to check Stripe status.'),
      );
    }
    return response.body.json;
  }

  public async syncWithStripe(syncId: string): Promise<TaonStripeSyncResult[]> {
    const response =
      await this.taonECommerceProductController.syncWithStripe(syncId)
        .request!();

    if (response.statusCode >= 400 || !Array.isArray(response.body?.json)) {
      throw new Error(
        response.responseText ||
          this.t.gettext('Stripe synchronization could not be completed.'),
      );
    }
    return response.body.json;
  }

  save(
    product: TaonECommerceProductEntity,
  ): Observable<HttpResponse<TaonECommerceProductEntity>> {
    return this.taonECommerceProductController.save(product).request()
      .observable;
  }

  async duplicate(productId: number): Promise<TaonECommerceProductEntity> {
    const response = await this.taonECommerceProductController
      .duplicate(productId).request();
    if (response.statusCode >= 400 || typeof response.body?.json?.id !== 'number') {
      throw new Error(
        response.responseText || this.t.gettext('Unable to duplicate the product.'),
      );
    }
    return response.body.json;
  }

  updateById(
    id: number | string,
    product: TaonECommerceProductEntity,
  ): Observable<HttpResponse<TaonECommerceProductEntity>> {
    return this.taonECommerceProductController.updateById(id, product).request()
      .observable;
  }

  getProductForEditing(
    productId: number,
  ): Observable<HttpResponse<TaonECommerceProductEntity>> {
    return this.taonECommerceProductController
      .getProductForEditing(productId)
      .request().observable;
  }
}
