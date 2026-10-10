//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-backoffice',
  templateUrl: './taon-e-commerce-backoffice.component.html',
  styleUrls: ['./taon-e-commerce-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommerceBackofficeComponent {
  componentLoaded = false;

  onRouteActivate(component: any): void {
    this.componentLoaded = !!component;
  }

  onRouteDeactivate(component: any): void {
    this.componentLoaded = false;
  }
}
