//#region imports
import * as os from 'os'; // @backend

import { AsyncPipe, JsonPipe, NgFor } from '@angular/common'; // @browser
import {
  inject,
  Injectable,
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  mergeApplicationConfig,
  provideZonelessChangeDetection,
  signal,
  ViewChild,
} from '@angular/core'; // @browser
import { Component } from '@angular/core'; // @browser
import { VERSION, OnInit } from '@angular/core'; // @browser
import { toSignal } from '@angular/core/rxjs-interop'; // @browser
import { MatButtonModule } from '@angular/material/button'; // @browser
import { MatCardModule } from '@angular/material/card'; // @browser
import { MatDialog } from '@angular/material/dialog'; // @browser
import { MatDividerModule } from '@angular/material/divider'; // @browser
import { MatIconModule } from '@angular/material/icon'; // @browser
import { MatListModule } from '@angular/material/list'; // @browser
import { MatTabsModule } from '@angular/material/tabs'; // @browser
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideRouter,
  Router,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
  ActivatedRoute,
  Routes,
  Route,
  withHashLocation,
  withComponentInputBinding,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { RenderMode, ServerRoute } from '@angular/ssr';
import Aura from '@primeng/themes/aura'; // @browser
import {
  EcommerceContext_1791132517217_initial,
  TaonAuthContextEntity,
  TaonAuthContextRepository,
  TaonECommerceAbstractContext,
  TaonECommerceCartProvider,
} from '@taon-dev/e-commerce/src';
import {
  TaonCartButtonComponent,
  TaonCartComponent,
  TaonECommerceProductApiService,
  TaonCartConfig,
} from '@taon-dev/e-commerce/src'; // @browser
import { Translation, TranslationManager } from '@taon-dev/i18n/src';
// TranslationManager.globalDefautlLanguageOverride = 'pl-PL';
import { TranslateDirective } from '@taon-dev/i18n/src'; // @browser
import {
  TaonSessionButtonComponent,
  TaonSessionComponent,
} from '@taon-dev/session/src'; // @browser
import {
  DEFAULT_SESSION_EMAIL,
  DEFAULT_SESSION_PASSWORD,
  TaonSessionConfig,
  TaonSessionIdentityProvider,
  TaonSessionProvider,
  TaonSessionUserEntity,
  TaonSessionUserIdentityRepository,
  TaonSessionUserRepository,
  TaonSessionUserUtils,
} from '@taon-dev/session/src';
import { TaonSudoAbstractContext } from '@taon-dev/sudo/src';
import {
  TaonBaselineBackofficeOutletName,
  TaonDraggableButtonPanelComponent,
} from '@taon-dev/ui/src'; // @browser
import { providePrimeNG } from 'primeng/config'; // @browser
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import {
  Taon,
  TaonBaseContext,
  TAON_CONTEXT,
  EndpointContext,
  TaonBaseAngularService,
  TaonEntity,
  StringColumn,
  TaonBaseAbstractEntity,
  TaonBaseCrudController,
  TaonController,
  GET,
  TaonMigration,
  TaonBaseMigration,
  TaonContext,
  ClassHelpers,
  TaonProvider,
} from 'taon/src';
import { TaonAdminService, TaonAdmin } from 'taon/src'; // @browser
import { TaonStor } from 'taon-storage/src';
import {
  TaonNotFoundComponent,
  TaonSettingsComponent,
  TaonThemeComponent,
  TaonThemeService,
} from 'taon-ui/src'; // @browser
import { Utils, UtilsOs } from 'tnp-core/src';

import { HOST_CONFIG } from './app.hosts';
import {
  ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET,
  ENV_ANGULAR_NODE_APP_CONFIG_STRIPE_SECRET_KEY,
  ENV_ANGULAR_NODE_APP_CONFIG_STRIPE_WEBHOOK_KEY,
  ENV_ANGULAR_NODE_APP_CONFIG_SUPER_USERS,
} from './lib/env/env.angular-node-app';
import { MIGRATIONS_CLASSES_FOR_ECommerce } from './lib/migrations';
// @placeholder-for-imports

//#endregion

//#region constants
//#region constants
console.log('🚀 [ TAON IS STARTING ]');
const DEFAULT_PASSWORD = DEFAULT_SESSION_PASSWORD;

const DEFAULT_EMAIL = DEFAULT_SESSION_EMAIL;

const DEFAULT_PASSWORD2 = DEFAULT_SESSION_PASSWORD;

const DEFAULT_EMAIL2 = 2 + DEFAULT_SESSION_EMAIL;

const DEFAULT_PASSWORD3 = DEFAULT_SESSION_PASSWORD;

const DEFAULT_EMAIL3 = 'dariusz@taon.dev';
//#endregion
const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP, {
  // debug: true
});
//#endregion

//#region e-commerce component
//#region @browser
@Component({
  selector: 'app-root',

  imports: [
    // RouterOutlet,
    AsyncPipe,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    RouterModule,
    TaonDraggableButtonPanelComponent,
    TaonSessionComponent,
    TaonSessionButtonComponent,
    TaonCartButtonComponent,
    TaonCartComponent,
    JsonPipe,
  ],
  providers: [TaonECommerceProductApiService],
  template: `
    @if (itemsLoaded()) {
      <mat-card class="m-2">
        <mat-card-content>
          <h3>Basic app info</h3>
          Name: taon-jwt-cookie-header-session<br />
          Angular version: {{ angularVersion }}<br />
          Taon backend: {{ taonMode }}<br />
          <div class="flex  flex-row items-center justify-center">
            <taon-session-button
              [config]="config"
              (context)="context = $event" />
            @if (context?.user) {
              <taon-cart-button [config]="cartConfig" />
            }
            @if (hasAccessToViewTaonAdminButton) {
              <ng-template #headerCenterTemplate>
                <span
                  class="inline-block w-2 h-2 rounded-full mr-2"
                  [class.bg-green-500]="context.user"
                  [class.bg-red-500]="!context.user">
                </span>

                @if (context.user) {
                  {{
                    t.gettext(
                      'Hello [[ username ]]',
                      {
                        username: context.user.username,
                      },
                      'header-taon-admin'
                    )
                  }}
                } @else {
                  <a
                    href="javascript:void(0)"
                    (click)="login()">
                    {{ t.gettext('Please login to use Taon Admin') }}</a
                  >
                }
              </ng-template>

              <taon-draggable-button-panel
                title="Taon Admin"
                [headerCenterTemplate]="headerCenterTemplate"
                [autoHideIcon]="false"
                [outlet]="outlet"
                [context]="context"
                [basePath]="basePath">
                <router-outlet [name]="outlet" />
              </taon-draggable-button-panel>
            }
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="m-2">
        <mat-card-content>
          @if (context?.user) {
            Test
            <!-- <taon-session [config]="config" /> -->
            <taon-cart [config]="cartConfig$ | async" />
          } @else {
            <h3>Login to see cart</h3>
          }
        </mat-card-content>
      </mat-card>
      <router-outlet></router-outlet>
    }
  `,
})
export class ECommerceApp implements OnInit {
  t = t.for(this);

  @ViewChild(TaonSessionButtonComponent)
  taonSessionButtonComponent!: TaonSessionButtonComponent;

  taonECommerceProductApiService = inject(TaonECommerceProductApiService);

  outlet = TaonBaselineBackofficeOutletName;

  config: TaonSessionConfig = {
    // linkToDashboard: '/',
    // defaultEmail: DEFAULT_EMAIL,
    // defaultPassword: DEFAULT_PASSWORD,
  };

  cartConfig$: Observable<TaonCartConfig> =
    this.taonECommerceProductApiService.getAllProductForUser();

  /**Required for proper theme*/
  theme = inject(TaonThemeService);

  public readonly context!: TaonAuthContextEntity;

  taonAdminService = inject(TaonAdminService);

  dialog = inject(MatDialog);

  activatedRoute = inject(ActivatedRoute);

  router = inject(Router);

  itemsLoaded = signal(false);

  year = new Date().getFullYear();

  taonMode = UtilsOs.isRunningInWebSQL() ? 'websql' : 'normal nodejs';

  angularVersion = VERSION.full;

  forceShowBaseRootApp = false;

  basePath!: string;

  private refresh = new BehaviorSubject<void>(undefined);

  get hasAccessToViewTaonAdminButton(): boolean {
    return this.context?.hasAccess?.toViewTaonAdminButton;
  }

  get activePath(): string {
    return globalThis?.location.pathname?.split('?')[0];
  }

  navItems =
    ECommerceClientRoutes.length <= 1
      ? []
      : ECommerceClientRoutes.filter(r => r.path !== undefined).map(r => ({
          path: r.path === '' ? '/' : `/${r.path}`,
          label: r.path === '' ? 'Home' : `${r.path}`,
        }));

  login(): void {
    this.taonSessionButtonComponent?.open();
  }

  openDialog(
    enterAnimationDuration: string | number,
    exitAnimationDuration: string | number,
  ): void {
    this.dialog.open(TaonSettingsComponent, {
      width: '400px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  ngOnInit(): void {
    this.basePath = ECommerceClientRoutes.find(
      c => c.outlet === TaonBaselineBackofficeOutletName,
    )?.path!;
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(globalThis?.location.pathname);
    // TODO set below from 1000 to zero in production
    void Taon.removeLoader(1000).then(() => {
      this.itemsLoaded.set(true);
    });
  }

  navigateTo(item: { path: string; label: string }): void {
    if (item.path === '/') {
      if (this.forceShowBaseRootApp) {
        return;
      }
      this.forceShowBaseRootApp = true;
      return;
    }
    this.forceShowBaseRootApp = false;
    void this.router.navigateByUrl(item.path);
  }
}
//#endregion
//#endregion

//#region  e-commerce routes
//#region @browser
export const ECommerceServerRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
export const ECommerceClientRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
  },
  {
    // SessionExampleRoutes
    path: 'app',
    loadChildren: () =>
      import('./app/e-commerce-example/e-commerce-example.routes').then(
        m => m.ECommerceExampleRoutes,
      ),
  },
  {
    path: 'backoffice',
    outlet: TaonBaselineBackofficeOutletName,
    providers: [
      {
        provide: TAON_CONTEXT,
        useFactory: () => ECommerceContext,
      },
    ],
    loadChildren: () =>
      import('./app/baseline-backoffice/taon-baseline-backoffice.routes').then(
        m => m.TaonBaselineBackofficeRoutes,
      ),
  },
  // PUT ALL ROUTES HERE
  // @placeholder-for-routes

  // uncomment this to have NOT FOUND route
  // {
  //   path: '**',
  //   component: TaonNotFoundComponent,
  // },
];
//#endregion
//#endregion

//#region  e-commerce app configs
//#region @browser
export const ECommerceAppConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    {
      provide: TAON_CONTEXT,
      useFactory: () => ECommerceContext,
    },
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => ECommerceStartFunction,
    },
    provideBrowserGlobalErrorListeners(),
    // remove withHashLocation() to use SSR
    provideRouter(
      ECommerceClientRoutes,
      withHashLocation(),
      withComponentInputBinding(),
    ),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled:
        !isDevMode() && !ENV_ANGULAR_NODE_APP_BUILD_PWA_DISABLE_SERVICE_WORKER,
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};

export const ECommerceServerConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(ECommerceServerRoutes))],
};

export const ECommerceConfig = mergeApplicationConfig(
  ECommerceAppConfig,
  ECommerceServerConfig,
);
//#endregion
//#endregion

//#region taon sesssion providers decorator
@TaonProvider({
  className: 'TaonSessionProvider',
})
class TaonSessionProviderOverride extends TaonSessionProvider {
  constructor() {
    super();
    this.socialLogin.google.enabled = true;
    this.socialLogin.google.googleClientId =
      ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID;

    this.login.defaultEmail = DEFAULT_EMAIL;
    this.linkSocialAccountEmail = true;
  }

  //#region @backend
  async _() {
    const googleSecret = await ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET();
    this.socialLogin.google.googleSecret = googleSecret;

    this.superUsersEmails = [
      DEFAULT_EMAIL,
      ...(await ENV_ANGULAR_NODE_APP_CONFIG_SUPER_USERS()).split(','),
    ];

    console.log('active super users', this.superUsersEmails);

    await super._();
  }
  //#endregion
}
//#endregion

//#region taon e-commerce cart providers decorator
@TaonProvider({
  className: 'TaonECommerceCartProvider',
})
class TaonECommerceCartProviderOverride extends TaonECommerceCartProvider {
  constructor() {
    super();
  }

  //#region @backend
  async _() {
    this.STRIPE_SECRET_KEY =
      await ENV_ANGULAR_NODE_APP_CONFIG_STRIPE_SECRET_KEY();
    this.STRIPE_WEBHOOK_SECRET_KEY =
      await ENV_ANGULAR_NODE_APP_CONFIG_STRIPE_WEBHOOK_KEY();
  }
  //#endregion
}
//#endregion

//#region  e-commerce context
var ECommerceContext = Taon.createContext(() => ({
  ...HOST_CONFIG['ECommerceContext'],
  contexts: {
    TaonECommerceAbstractContext,
    TaonSudoAbstractContext,
    TaonBaseContext,
  },
  migrations: {
    EcommerceContext_1791132517217_initial,
    ...MIGRATIONS_CLASSES_FOR_ECommerce,
  },
  providers: {
    [ClassHelpers.getName(TaonSessionProvider)]: TaonSessionProviderOverride,
    [ClassHelpers.getName(TaonECommerceCartProvider)]:
      TaonECommerceCartProviderOverride,
  },
  entities: {
    [ClassHelpers.getName(TaonAuthContextEntity)]: TaonAuthContextEntity,
  },
  repositories: {
    [ClassHelpers.getName(TaonAuthContextRepository)]:
      TaonAuthContextRepository,
  },
  logs: {
    // db
    migrations: true,
  },
  database: true,
  disabledRealtime: true,
}));
//#endregion

//#region  e-commerce start function
export const ECommerceStartFunction = async (
  startParams?: Taon.StartParams,
): Promise<void> => {
  TranslationManager.Instance.visibleLanguages = ['en-US', 'pl-PL'];
  // await TranslationManager.Instance.changeGlobalLang('en-US');

  // await TranslationManager.Instance.setOneLanguagePernament('en-US')

  //#region @browser
  TaonAdmin.init();
  await TaonStor.awaitAll();
  //#endregion

  const ref = await ECommerceContext.initialize(startParams);
  console.log('I AM AFTER INIT')

  //#region add default email
  //#region @backend
  //#region @esmRemove

  const taonSessionUserRepository = ref.getInstanceBy(
    TaonSessionUserRepository,
  );

  const taonSessionUserIdentityRepository = ref.getInstanceBy(
    TaonSessionUserIdentityRepository,
  );

  await (async () => {
    const existingIdentity =
      await taonSessionUserIdentityRepository.findPasswordIdentity(
        DEFAULT_EMAIL,
      );

    if (!existingIdentity) {
      const user = await taonSessionUserRepository.save(
        new TaonSessionUserEntity().clone({
          username: TaonSessionUserUtils.generateRandomUsername(),
        }),
      );

      await taonSessionUserIdentityRepository.createPasswordIdentity(
        user.id,
        DEFAULT_EMAIL,
        DEFAULT_PASSWORD,
      );

      await taonSessionUserIdentityRepository.createSocialIdentity(
        user.id,
        TaonSessionIdentityProvider.GOOGLE,
        'idfromgoogle',
        `fromgogle${DEFAULT_EMAIL}`,
        true,
      );
    }
  })();

  await (async () => {
    const existingIdentity =
      await taonSessionUserIdentityRepository.findPasswordIdentity(
        DEFAULT_EMAIL2,
      );

    if (!existingIdentity) {
      const user = await taonSessionUserRepository.save(
        new TaonSessionUserEntity().clone({
          username: TaonSessionUserUtils.generateRandomUsername(),
        }),
      );

      await taonSessionUserIdentityRepository.createPasswordIdentity(
        user.id,
        DEFAULT_EMAIL2,
        DEFAULT_PASSWORD2,
      );

      await taonSessionUserIdentityRepository.createSocialIdentity(
        user.id,
        TaonSessionIdentityProvider.MICROSOFT,
        'idfrommicrosoft',
        `fromgogle${DEFAULT_EMAIL2}`,
        true,
      );
    }
  })();

  await (async () => {
    const existingIdentity =
      await taonSessionUserIdentityRepository.findPasswordIdentity(
        DEFAULT_EMAIL,
      );

    if (!existingIdentity) {
      const user = await taonSessionUserRepository.save(
        new TaonSessionUserEntity().clone({
          username: TaonSessionUserUtils.generateRandomUsername(),
        }),
      );

      await taonSessionUserIdentityRepository.createPasswordIdentity(
        user.id,
        DEFAULT_EMAIL,
        DEFAULT_PASSWORD,
      );

      await taonSessionUserIdentityRepository.createSocialIdentity(
        user.id,
        TaonSessionIdentityProvider.GOOGLE,
        'idfromgoogle',
        `fromgogle${DEFAULT_EMAIL}`,
        true,
      );
    }
  })();

  await (async () => {
    const existingIdentity =
      await taonSessionUserIdentityRepository.findPasswordIdentity(
        DEFAULT_EMAIL3,
      );

    if (!existingIdentity) {
      const user = await taonSessionUserRepository.save(
        new TaonSessionUserEntity().clone({
          username: TaonSessionUserUtils.generateRandomUsername(),
        }),
      );

      await taonSessionUserIdentityRepository.createSocialIdentity(
        user.id,
        TaonSessionIdentityProvider.GOOGLE,
        'idfromgoogle2',
        `fromgogle${DEFAULT_EMAIL3}`,
        true,
      );
    }
  })();
  //#endregion

  //#endregion
  //#endregion

  //#region @backend
  //#region @esmRemove
  if (
    startParams?.onlyMigrationRun ||
    startParams?.onlyMigrationRevertToTimestamp
  ) {
    process.exit(0);
  }
  //#endregion
  //#endregion

  //#region @backend
  //#region @esmRemove
  console.log(`Hello in NodeJs backend! os=${os.platform()}`);
  //#endregion
  //#endregion
};
//#endregion

//#region default export
export default ECommerceStartFunction;
//#endregion
