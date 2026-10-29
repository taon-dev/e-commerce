//#region imports
import { Routes } from '@angular/router';
import { adminLazyRoute } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

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
        menuItem: t.signal.gettext('Dashboard'),
        icon: 'dashboard',
        loader: () =>
          import('../taon-e-commerce-backoffice-dashboard/taon-e-commerce-backoffice-dashboard.routes').then(
            m => m.TaonECommerceBackofficeDashboardRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'products',
        menuItem: t.signal.gettext('Products'),
        icon: 'inventory',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-product/taon-e-commerce-products-backoffice/taon-e-commerce-products-backoffice.routes').then(
            m => m.TaonECommerceProductsBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'orders',
        menuItem: t.signal.gettext('Orders'),
        icon: 'receipt_long',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-order/taon-e-commerce-orders-backoffice/taon-e-commerce-orders-backoffice.routes').then(
            m => m.TaonECommerceOrdersBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'payment-transactions',
        menuItem: t.signal.gettext('Transactions'),
        icon: 'payments',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-payment-transaction/taon-e-commerce-payment-transactions-backoffice/taon-e-commerce-payment-transactions-backoffice.routes').then(
            m => m.TaonECommercePaymentTransactionsBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'settings',
        menuItem: t.signal.gettext('Settings'),
        icon: 'settings',
        expandable: false,
        loader: () =>
          import('../taon-e-commerce-backoffice-settings/taon-e-commerce-backoffice-settings.routes').then(
            m => m.TaonECommerceBackofficeSettingsRoutes,
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
