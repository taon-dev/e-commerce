//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceCartItemEntity } from './taon-e-commerce-cart-item.entity';
import { TaonECommerceCartItemController } from './taon-e-commerce-cart-item.controller';
//#endregion

@Injectable()
export class TaonECommerceCartItemApiService extends TaonBaseAngularService {
  private taonECommerceCartItemController = this.injectController(TaonECommerceCartItemController);

  public get allMyEntities$(): Observable<TaonECommerceCartItemEntity[]> {
    return this.taonECommerceCartItemController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceCartItemController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}