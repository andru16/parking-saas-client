import { Outlet } from 'react-router-dom';
import { AppFooter } from '@/layouts/app/AppFooter';
import { AppHeader } from '@/layouts/app/AppHeader';
import { AppSidebar } from '@/layouts/app/AppSidebar';
import { SidebarProvider } from '@/layouts/app/SidebarContext';
import { TrialPremiumBanner } from '@/modules/subscriptionActivation/components/TrialPremiumBanner';

/**
 * Shell autenticado — visual alineado con Super Admin (slate + teal).
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-100 text-slate-900">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col transition-[margin] duration-300">
          <TrialPremiumBanner />
          <AppHeader />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
