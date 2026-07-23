import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppLogo } from '@/components/brand/AppLogo';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Parking SaaS';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <header className="flex justify-center px-6 py-6">
        <Link to="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
          <AppLogo size="lg" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {appName}
      </footer>
    </div>
  );
}
