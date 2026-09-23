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

  get isEnableOption() {
    return this.taonECommerceCartProvider.enabledTaonECommerceCartOption;
  }
}