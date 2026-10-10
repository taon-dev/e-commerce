//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const TaonECommerceBackofficeDashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-backoffice-dashboard.component').then(m => m.TaonECommerceBackofficeDashboardComponent),

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
 * By default exporting TaonECommerceBackofficeDashboardRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommerceBackofficeDashboardRoutes;