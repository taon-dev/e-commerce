//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonECommerceProductProvider } from './taon-e-commerce-product.provider';
//#endregion

@Injectable()
export class TaonECommerceProductConfigService extends TaonBaseAngularService {
  private taonECommerceProductProvider = this.injectProvider(TaonECommerceProductProvider);

  get isEnableOption() {
    return this.taonECommerceProductProvider.enabledTaonECommerceProductOption;
  }
}