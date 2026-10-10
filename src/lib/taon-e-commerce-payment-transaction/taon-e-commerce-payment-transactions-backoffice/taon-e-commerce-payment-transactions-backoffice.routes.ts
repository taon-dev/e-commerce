//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const TaonECommercePaymentTransactionsBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-payment-transactions-backoffice.component').then(m => m.TaonECommercePaymentTransactionsBackofficeComponent),

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
 * By default exporting TaonECommercePaymentTransactionsBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommercePaymentTransactionsBackofficeRoutes;