import { Injectable } from '@angular/core';
import { TaonBaseAngularService } from 'taon/src';

import { TaonECommerceCustomerController } from './taon-e-commerce-customer.controller';

@Injectable()
export class TaonECommerceCustomerApiService extends TaonBaseAngularService {
  readonly controller = this.injectController(TaonECommerceCustomerController);
}
