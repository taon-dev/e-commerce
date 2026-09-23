//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceProductEntity } from './taon-e-commerce-product.entity';
import { TaonECommerceProductController } from './taon-e-commerce-product.controller';
//#endregion

@Injectable()
export class TaonECommerceProductApiService extends TaonBaseAngularService {
  private taonECommerceProductController = this.injectController(TaonECommerceProductController);

  public get allMyEntities$(): Observable<TaonECommerceProductEntity[]> {
    return this.taonECommerceProductController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceProductController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}