//#region imports
import { Routes } from '@angular/router';
//#endregion

export const TaonECommerceProductsBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-e-commerce-products-backoffice.component').then(m => m.TaonECommerceProductsBackofficeComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../taon-e-commerce-product-edit-dialog.component').then(
        m => m.TaonECommerceProductEditDialogComponent,
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../taon-e-commerce-product-edit-dialog.component').then(
        m => m.TaonECommerceProductEditDialogComponent,
      ),
  },
];

/**
 * By default exporting TaonECommerceProductsBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonECommerceProductsBackofficeRoutes;