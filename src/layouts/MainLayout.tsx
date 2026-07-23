import { type ReactNode } from 'react';
import { AppLogo } from '@/components/brand/AppLogo';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Parking SaaS';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <AppLogo size="sm" className="max-h-10" />
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} {appName}
        </div>
      </footer>
    </div>
  );
}
