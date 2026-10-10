//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonCartConfig } from '../index';

import { TaonECommerceProductController } from './taon-e-commerce-product.controller';
import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
//#endregion

@Injectable()
export class TaonECommerceProductApiService extends TaonBaseAngularService {
  public readonly taonECommerceProductController = this.injectController(
    TaonECommerceProductController,
  );

  public getAllProductForUser(): Observable<TaonCartConfig> {
    return this.taonECommerceProductController.getAll()
      .request!().observable.pipe(
      map(res => res.body.json),
      map(c => ({
        suggestedProducts: c,
      })),
    );
  }

  public async syncWithStripe(): Promise<void> {
    const response =
      await this.taonECommerceProductController.syncWithStripe().request!();

    if (response.statusCode >= 400) {
      throw new Error(
        response.responseText ||
          'Stripe synchronization is not configured for this project.',
      );
    }
  }
}
