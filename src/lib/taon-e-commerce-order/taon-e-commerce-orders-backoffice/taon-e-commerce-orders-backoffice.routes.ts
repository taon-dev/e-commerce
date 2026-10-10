//#region imports
import { Routes } from '@angular/router';
//#endregion

export const TaonECommerceOrdersBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-orders-backoffice.component').then(
        m => m.TaonECommerceOrdersBackofficeComponent,
      ),

    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./taon-e-commerce-order-details-backoffice.component').then(
            m => m.TaonECommerceOrderDetailsBackofficeComponent,
          ),
      },
    ],
  },
];

/**
 * By default exporting TaonECommerceOrdersBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommerceOrdersBackofficeRoutes;
