//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-e-commerce-backoffice-settings',
  templateUrl: './taon-e-commerce-backoffice-settings.component.html',
  styleUrls: ['./taon-e-commerce-backoffice-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonECommerceBackofficeSettingsComponent {}