//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceCartProvider } from './taon-e-commerce-cart.provider';
//#endregion

@Injectable()
export class TaonECommerceCartConfigService extends TaonBaseAngularService {
  private taonECommerceCartProvider = this.injectProvider(TaonECommerceCartProvider);

  get STRIPE_SECRET_KEY():string {
    return this.taonECommerceCartProvider.STRIPE_SECRET_KEY;
  }

  get STRIPE_WEBHOOK_SECRET_KEY():string {
    return this.taonECommerceCartProvider.STRIPE_WEBHOOK_SECRET_KEY;
  }
}
