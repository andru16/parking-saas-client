import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SessionExpiredPage } from '@/pages/SessionExpiredPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PERMISSIONS } from '@/modules/auth/permissions';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { GuestRoute } from '@/routes/GuestRoute';
import { SetupGuard, SetupRoute } from '@/routes/SetupGuard';
import { RoleGuard } from '@/modules/navigation/RoleGuard';
import { SuperAdminAuthProvider } from '@/modules/superAdmin/SuperAdminAuthProvider';
import { SuperAdminProtectedRoute } from '@/modules/superAdmin/SuperAdminGuards';
import { SuperAdminLayout } from '@/modules/superAdmin/SuperAdminLayout';

function lazyPage<T extends ComponentType<object>>(
  factory: () => Promise<{ [key: string]: T }>,
  exportName: string,
) {
  return lazy(async () => {
    const mod = await factory();
    return { default: mod[exportName] as T };
  });
}

const SignupPage = lazyPage(() => import('@/pages/SignupPage'), 'SignupPage');
const ForgotPasswordPage = lazyPage(() => import('@/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const SetupPage = lazyPage(() => import('@/pages/SetupPage'), 'SetupPage');
const DashboardPage = lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage');
const OperationsPage = lazyPage(() => import('@/pages/OperationsPage'), 'OperationsPage');
const CashRegisterPage = lazyPage(() => import('@/pages/CashRegisterPage'), 'CashRegisterPage');
const ReportsPage = lazyPage(() => import('@/pages/ReportsPage'), 'ReportsPage');
const AuditPage = lazyPage(() => import('@/pages/AuditPage'), 'AuditPage');
const NotificationsPage = lazyPage(() => import('@/pages/NotificationsPage'), 'NotificationsPage');
const MembersPage = lazyPage(() => import('@/pages/MembersPage'), 'MembersPage');
const MembershipsPage = lazyPage(() => import('@/pages/MembershipsPage'), 'MembershipsPage');
const PaymentsPage = lazyPage(() => import('@/pages/PaymentsPage'), 'PaymentsPage');
const SettingsLayout = lazyPage(() => import('@/pages/settings/SettingsLayout'), 'SettingsLayout');
const SettingsIndexPage = lazyPage(
  () => import('@/pages/settings/SettingsIndexPage'),
  'SettingsIndexPage',
);
const SettingsGeneralPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsGeneralPage: m.SettingsGeneralPage })),
  'SettingsGeneralPage',
);
const SettingsOperationalPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsOperationalPage: m.SettingsOperationalPage })),
  'SettingsOperationalPage',
);
const SettingsCategoriesPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsCategoriesPage: m.SettingsCategoriesPage })),
  'SettingsCategoriesPage',
);
const SettingsRatesPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsRatesPage: m.SettingsRatesPage })),
  'SettingsRatesPage',
);
const SettingsPaymentMethodsPage = lazyPage(
  () =>
    import('@/pages/settings').then((m) => ({
      SettingsPaymentMethodsPage: m.SettingsPaymentMethodsPage,
    })),
  'SettingsPaymentMethodsPage',
);
const SettingsCashPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsCashPage: m.SettingsCashPage })),
  'SettingsCashPage',
);
const SettingsPrintingPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsPrintingPage: m.SettingsPrintingPage })),
  'SettingsPrintingPage',
);
const SettingsMembershipsPage = lazyPage(
  () =>
    import('@/pages/settings').then((m) => ({ SettingsMembershipsPage: m.SettingsMembershipsPage })),
  'SettingsMembershipsPage',
);
const SettingsUsersPage = lazyPage(
  () => import('@/pages/settings').then((m) => ({ SettingsUsersPage: m.SettingsUsersPage })),
  'SettingsUsersPage',
);
const SettingsRolesPage = lazyPage(
  () => import('@/pages/settings/SettingsRolesPage'),
  'SettingsRolesPage',
);
const SettingsIntegrationsPage = lazyPage(
  () =>
    import('@/pages/settings').then((m) => ({
      SettingsIntegrationsPage: m.SettingsIntegrationsPage,
    })),
  'SettingsIntegrationsPage',
);
const SettingsBackupsPage = lazyPage(
  () =>
    import('@/pages/settings').then((m) => ({
      SettingsBackupsPage: m.SettingsBackupsPage,
    })),
  'SettingsBackupsPage',
);

const SuperAdminLoginPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminLoginPage'),
  'SuperAdminLoginPage',
);
const SuperAdminDashboardPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminDashboardPage'),
  'SuperAdminDashboardPage',
);
const SuperAdminOrganizationsPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminOrganizationsPage'),
  'SuperAdminOrganizationsPage',
);
const SuperAdminOrganizationDetailPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminOrganizationDetailPage'),
  'SuperAdminOrganizationDetailPage',
);
const SuperAdminPlansPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminPlansPage'),
  'SuperAdminPlansPage',
);
const SuperAdminBackupsPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminBackupsPage'),
  'SuperAdminBackupsPage',
);
const SuperAdminSystemSettingsPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminSystemSettingsPage'),
  'SuperAdminSystemSettingsPage',
);
const SuperAdminSupportPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminSupportPage'),
  'SuperAdminSupportPage',
);
const SuperAdminSupportDetailPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminSupportPage'),
  'SuperAdminSupportDetailPage',
);
const SupportPage = lazyPage(() => import('@/pages/SupportPage'), 'SupportPage');
const SupportDetailPage = lazyPage(
  () => import('@/pages/SupportDetailPage'),
  'SupportDetailPage',
);
const SuperAdminPlanFormPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminPlanFormPage'),
  'SuperAdminPlanFormPage',
);
const SuperAdminSubscriptionAlertsPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminSubscriptionAlertsPage'),
  'SuperAdminSubscriptionAlertsPage',
);
const SuperAdminAuditPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminAuditPage'),
  'SuperAdminAuditPage',
);
const SuperAdminNotificationsPage = lazyPage(
  () => import('@/modules/superAdmin/pages/SuperAdminNotificationsPage'),
  'SuperAdminNotificationsPage',
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
      Cargando…
    </div>
  );
}

function SuspensePage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

/**
 * Organización de rutas:
 * - Super Admin backoffice (/admin) — independiente del cliente
 * - Públicas / guest
 * - Setup wizard (auth + setup flags)
 * - App privada (auth + setup completo + permisos)
 *
 * Páginas pesadas cargan con React.lazy (code splitting).
 */
export const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <SuperAdminAuthProvider>
        <Outlet />
      </SuperAdminAuthProvider>
    ),
    children: [
      {
        path: 'login',
        element: (
          <SuspensePage>
            <SuperAdminLoginPage />
          </SuspensePage>
        ),
      },
      {
        element: <SuperAdminProtectedRoute />,
        children: [
          {
            element: <SuperAdminLayout />,
            children: [
              {
                index: true,
                element: (
                  <SuspensePage>
                    <SuperAdminDashboardPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'organizations',
                element: (
                  <SuspensePage>
                    <SuperAdminOrganizationsPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'organizations/:organizationId',
                element: (
                  <SuspensePage>
                    <SuperAdminOrganizationDetailPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'subscriptions',
                element: (
                  <SuspensePage>
                    <SuperAdminSubscriptionAlertsPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'audit',
                element: (
                  <SuspensePage>
                    <SuperAdminAuditPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'notifications',
                element: (
                  <SuspensePage>
                    <SuperAdminNotificationsPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'plans',
                element: (
                  <SuspensePage>
                    <SuperAdminPlansPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'backups',
                element: (
                  <SuspensePage>
                    <SuperAdminBackupsPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'system-settings',
                element: (
                  <SuspensePage>
                    <SuperAdminSystemSettingsPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'support',
                element: (
                  <SuspensePage>
                    <SuperAdminSupportPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'support/:id',
                element: (
                  <SuspensePage>
                    <SuperAdminSupportDetailPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'plans/new',
                element: (
                  <SuspensePage>
                    <SuperAdminPlanFormPage />
                  </SuspensePage>
                ),
              },
              {
                path: 'plans/:planId',
                element: (
                  <SuspensePage>
                    <SuperAdminPlanFormPage />
                  </SuspensePage>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  {
    path: '/',
    element: (
      <MainLayout>
        <HomePage />
      </MainLayout>
    ),
  },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/registro',
    element: (
      <GuestRoute>
        <AuthLayout
          title="Crear cuenta"
          subtitle="Registre su parqueadero y comience la prueba gratuita"
        >
          <SuspensePage>
            <SignupPage />
          </SuspensePage>
        </AuthLayout>
      </GuestRoute>
    ),
  },
  {
    path: '/recuperar-contrasena',
    element: (
      <GuestRoute>
        <SuspensePage>
          <ForgotPasswordPage />
        </SuspensePage>
      </GuestRoute>
    ),
  },
  { path: '/sesion-expirada', element: <SessionExpiredPage /> },

  {
    path: '/setup',
    element: (
      <ProtectedRoute>
        <SetupRoute>
          <AppLayout />
        </SetupRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspensePage>
            <SetupPage />
          </SuspensePage>
        ),
      },
    ],
  },

  {
    element: (
      <ProtectedRoute>
        <SetupGuard>
          <AppLayout />
        </SetupGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <SuspensePage>
            <DashboardPage />
          </SuspensePage>
        ),
      },
      {
        path: '/operations',
        element: (
          <RoleGuard permissions={[PERMISSIONS.TICKETS_CREATE, PERMISSIONS.TICKETS_CLOSE]}>
            <SuspensePage>
              <OperationsPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/cash',
        element: (
          <RoleGuard permissions={[PERMISSIONS.CASH_VIEW, PERMISSIONS.CASH_OPEN]}>
            <SuspensePage>
              <CashRegisterPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/reports',
        element: (
          <RoleGuard permissions={PERMISSIONS.REPORTS_VIEW}>
            <SuspensePage>
              <ReportsPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/audit',
        element: (
          <RoleGuard permissions={PERMISSIONS.AUDIT_VIEW}>
            <SuspensePage>
              <AuditPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/support',
        element: (
          <RoleGuard permissions={PERMISSIONS.SUPPORT_VIEW}>
            <SuspensePage>
              <SupportPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/support/:id',
        element: (
          <RoleGuard permissions={PERMISSIONS.SUPPORT_VIEW}>
            <SuspensePage>
              <SupportDetailPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/notifications',
        element: (
          <SuspensePage>
            <NotificationsPage />
          </SuspensePage>
        ),
      },
      {
        path: '/vehicles',
        element: <Navigate to="/members" replace />,
      },
      {
        path: '/members',
        element: (
          <RoleGuard permissions={PERMISSIONS.MEMBERS_MANAGE}>
            <SuspensePage>
              <MembersPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/memberships',
        element: (
          <RoleGuard permissions={PERMISSIONS.MEMBERSHIPS_MANAGE}>
            <SuspensePage>
              <MembershipsPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/payments',
        element: (
          <RoleGuard permissions={PERMISSIONS.PAYMENTS_VIEW}>
            <SuspensePage>
              <PaymentsPage />
            </SuspensePage>
          </RoleGuard>
        ),
      },
      {
        path: '/settings',
        element: (
          <RoleGuard
            permissions={[
              PERMISSIONS.SETTINGS_MANAGE,
              PERMISSIONS.USERS_MANAGE,
              PERMISSIONS.ROLES_MANAGE,
            ]}
          >
            <SuspensePage>
              <SettingsLayout />
            </SuspensePage>
          </RoleGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <SuspensePage>
                <SettingsIndexPage />
              </SuspensePage>
            ),
          },
          {
            path: 'general',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsGeneralPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'operational',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsOperationalPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'categories',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsCategoriesPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'rates',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsRatesPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'payment-methods',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsPaymentMethodsPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'cash',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsCashPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'printing',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsPrintingPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'memberships',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsMembershipsPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'users',
            element: (
              <RoleGuard permissions={PERMISSIONS.USERS_MANAGE}>
                <SuspensePage>
                  <SettingsUsersPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'roles',
            element: (
              <RoleGuard permissions={PERMISSIONS.ROLES_MANAGE}>
                <SuspensePage>
                  <SettingsRolesPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'integrations',
            element: (
              <RoleGuard permissions={PERMISSIONS.SETTINGS_MANAGE}>
                <SuspensePage>
                  <SettingsIntegrationsPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
          {
            path: 'backups',
            element: (
              <RoleGuard
                permissions={[PERMISSIONS.BACKUPS_VIEW, PERMISSIONS.BACKUPS_MANAGE]}
              >
                <SuspensePage>
                  <SettingsBackupsPage />
                </SuspensePage>
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: '/acceso-denegado',
        element: <AccessDeniedPage />,
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
