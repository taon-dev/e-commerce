//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonECommerceCustomerAddressEntity } from './taon-e-commerce-customer-address.entity';
import { TaonECommerceCustomerAddressController } from './taon-e-commerce-customer-address.controller';
//#endregion

@Injectable()
export class TaonECommerceCustomerAddressApiService extends TaonBaseAngularService {
  public readonly taonECommerceCustomerAddressController = this.injectController(TaonECommerceCustomerAddressController);

  public get allMyEntities$(): Observable<TaonECommerceCustomerAddressEntity[]> {
    return this.taonECommerceCustomerAddressController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user: string): Observable<string> {
    return this.taonECommerceCustomerAddressController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}