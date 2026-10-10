//#region imports
import { Routes } from '@angular/router';
//#endregion

export const TaonECommercePaymentTransactionsBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-payment-transactions-backoffice.component').then(
        m => m.TaonECommercePaymentTransactionsBackofficeComponent,
      ),

    children: [
      {
        path: ':id',
        loadComponent: () =>
          import('./taon-e-commerce-payment-transaction-details-backoffice.component').then(
            m => m.TaonECommercePaymentTransactionDetailsBackofficeComponent,
          ),
      },
    ],
  },
];

/**
 * By default exporting TaonECommercePaymentTransactionsBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommercePaymentTransactionsBackofficeRoutes;
