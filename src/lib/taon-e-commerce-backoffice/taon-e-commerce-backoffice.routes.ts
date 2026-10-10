//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
//#endregion

export const TaonECommerceBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-backoffice.component').then(
        m => m.TaonECommerceBackofficeComponent,
      ),

    children: [
      adminLazyRoute({
        path: 'dashboard',
        menuItem: 'Dashboard',
        icon: 'dashboard',
        loader: () =>
          import('../taon-e-commerce-backoffice-dashboard/taon-e-commerce-backoffice-dashboard.routes').then(
            m => m.TaonECommerceBackofficeDashboardRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'products',
        menuItem: 'Products',
        icon: 'inventory',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-product/taon-e-commerce-products-backoffice/taon-e-commerce-products-backoffice.routes').then(
            m => m.TaonECommerceProductsBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'payment-transactions',
        menuItem: 'Payment Trasactions',
        icon: 'payments',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transactions-backoffice/taon-e-commerce-payment-transactions-backoffice.routes').then(
            m => m.TaonECommercePaymentTransactionsBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'settings',
        menuItem: 'Settings',
        icon: 'settings',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-backoffice-dashboard/taon-e-commerce-backoffice-dashboard.routes').then(
            m => m.TaonECommerceBackofficeDashboardRoutes,
          ),
      }),
    ],
  },
];

/**
 * By default exporting TaonECommerceBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommerceBackofficeRoutes;
