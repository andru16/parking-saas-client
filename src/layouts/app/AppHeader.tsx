import { Menu } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { AppBreadcrumbs } from '@/layouts/app/AppBreadcrumbs';
import { NotificationBell } from '@/layouts/app/NotificationBell';
import { OrganizationSwitcher } from '@/layouts/app/OrganizationSwitcher';
import { UserMenu } from '@/layouts/app/UserMenu';
import { useSidebar } from '@/layouts/app/SidebarContext';

export function AppHeader() {
  const { user } = useAuth();
  const { setMobileOpen, collapsed, toggleCollapsed } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* Tablet: acceso rápido a colapsar sin depender solo del sidebar */}
        <button
          type="button"
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:inline-flex lg:hidden"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="min-w-0 flex-1">
          <AppBreadcrumbs />
        </div>

        <OrganizationSwitcher organizationName={user?.organization?.name} />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
