//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceOrderItemEntity } from './taon-e-commerce-order-item.entity';
import { TaonECommerceOrderItemController } from './taon-e-commerce-order-item.controller';
//#endregion

@Injectable()
export class TaonECommerceOrderItemApiService extends TaonBaseAngularService {
  public readonly taonECommerceOrderItemController = this.injectController(TaonECommerceOrderItemController);

  public get allMyEntities$(): Observable<TaonECommerceOrderItemEntity[]> {
    return this.taonECommerceOrderItemController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceOrderItemController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}