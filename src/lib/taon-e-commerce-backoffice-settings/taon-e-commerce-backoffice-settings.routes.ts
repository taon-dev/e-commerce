//#region imports
import { Routes } from '@angular/router';
//#endregion

export const TaonECommerceBackofficeSettingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-backoffice-settings.component').then(
        m => m.TaonECommerceBackofficeSettingsComponent,
      ),

    children: [
      // adminLazyRoute({
      //   path: 'dashboard',
      //   menuItem: 'Dashboard',
      //   icon: 'dashboard',
      //   expandable: false,
      //   loader: () =>
      //     import('./anothermodule.routes').then(m => m.DashboardRoutes),
      // }),
    ],
  },
];

/**
 * By default exporting TaonECommerceBackofficeSettingsRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommerceBackofficeSettingsRoutes;
