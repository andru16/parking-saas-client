import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '@/modules/superAdmin/SuperAdminAuthProvider';
import { filterSuperAdminNav } from '@/modules/superAdmin/nav.config';
import { SuperAdminNotificationBell } from '@/modules/superAdmin/SuperAdminNotificationBell';

export function SuperAdminLayout() {
  const { user, logout } = useSuperAdminAuth();
  const navigate = useNavigate();
  const items = filterSuperAdminNav(user?.permissions);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="flex w-60 shrink-0 flex-col bg-slate-950 text-slate-100">
          <div className="border-b border-slate-800 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
              Parking SaaS
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">Super Admin</h1>
            <p className="mt-1 text-xs text-slate-400">Backoffice de plataforma</p>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {items.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 px-4 py-4">
            <p className="truncate text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-900"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-2 border-b border-slate-200/80 bg-slate-100/90 px-6 backdrop-blur">
            <SuperAdminNotificationBell />
          </header>
          <div className="mx-auto max-w-6xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
