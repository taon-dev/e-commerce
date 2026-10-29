//#region imports
import { Routes } from '@angular/router';
import { TaonAuthContextEntity } from '@taon-dev/e-commerce/src';
import { adminLazyRoute as adminLazyRouteBase } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';
//#endregion
const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

const adminLazyRoute = adminLazyRouteBase<TaonAuthContextEntity>;

export const TaonBaselineBackofficeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./taon-baseline-backoffice.component').then(
        m => m.TaonBaselineBackofficeComponent,
      ),

    children: [
      adminLazyRoute({
        isVisible: ({ context }) =>
          context?.isSuperUser || context?.isLocalhostBackend,
        path: 'welcome',
        menuItem: t.signal.gettext('Welcome'),
        // color: 'red',
        icon: 'waving_hand',
        expandable: false,
        loader: () =>
          import('@taon-dev/ui/src').then(m => m.TaonAdminWelcomeRoutes),
      }),
      adminLazyRoute({
        path: 'sudo',
        menuItem: t.signal.gettext('Sudo'),
        color: 'red',
        icon: 'supervisor_account',
        expandable: true,
        loader: () =>
          import('@taon-dev/sudo/src').then(m => m.TaonSudoBackofficeRoutes),
      }),
      adminLazyRoute({
        path: 'cms',
        menuItem: t.signal.gettext('CMS'),
        expandable: true,
        icon: 'content_copy',
        loader: () =>
          import('@taon-dev/cms/src').then(m => m.TaonCmsBackofficeRoutes),
      }),
      adminLazyRoute({
        path: 'e-commerce',
        menuItem: t.signal.gettext('E-commerce'),
        expandable: true,
        icon: 'sell',
        loader: () =>
          import('@taon-dev/e-commerce/src').then(
            m => m.TaonECommerceBackofficeRoutes,
          ),
      }),

      adminLazyRoute({
        path: 'users',
        menuItem: t.signal.gettext('Users'),
        icon: 'manage_accounts',
        expandable: false,
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeUsersRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'session',
        menuItem: t.signal.gettext('Sessions'),
        expandable: false,
        icon: 'login',
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonSessionBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'authorization',
        menuItem: t.signal.gettext('Authorization'),
        icon: 'apps',
        expandable: true,
        loader: () =>
          import('@taon-dev/session/src').then(
            m => m.TaonAuthorizationBackofficeRoutes,
          ),
      }),
      adminLazyRoute({
        path: 'emails',
        menuItem: t.signal.gettext('Emails'),
        expandable: false,
        icon: 'email',
        loader: () =>
          import('@taon-dev/emails/src').then(
            m => m.TaonEmailsBackofficeRoutes,
          ),
      }),
    ],
  },
];

/**
 * By default exporting TaonBaselineBackofficeRoutes,
 * the command `taon generate:app:routes`
 * will automatically add them to the root routes in ./src/app.ts.
 */
// export default TaonBaselineBackofficeRoutes;
