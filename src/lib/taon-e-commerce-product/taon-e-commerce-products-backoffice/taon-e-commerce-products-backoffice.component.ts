//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-products-backoffice',
  templateUrl: './taon-e-commerce-products-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-products-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommerceProductsBackofficeComponent {}