//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceCartItemProvider } from './taon-e-commerce-cart-item.provider';
//#endregion

@Injectable()
export class TaonECommerceCartItemConfigService extends TaonBaseAngularService {
  private taonECommerceCartItemProvider = this.injectProvider(TaonECommerceCartItemProvider);

  get isEnableOption() {
    return this.taonECommerceCartItemProvider.enabledTaonECommerceCartItemOption;
  }
}