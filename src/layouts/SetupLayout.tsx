import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

/**
 * Shell mínimo para configuración inicial: sin sidebar ni menú de la app.
 */
export function SetupLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const appName = import.meta.env.VITE_APP_NAME ?? 'Parking SaaS';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-primary-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              P
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{appName}</p>
              <p className="text-[11px] text-slate-500">Configuración inicial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <p className="hidden text-xs text-slate-500 sm:block">
                {user.firstName} {user.lastName}
              </p>
            )}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-200/60 py-4 text-center text-xs text-slate-400">
        Complete la configuración para acceder a su parqueadero
      </footer>
    </div>
  );
}
