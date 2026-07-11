import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-slate-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-slate-500">{user.role?.displayName ?? user.role?.name}</p>
      </div>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/15 text-sm font-semibold text-teal-800"
        title={user.email}
      >
        {initials}
      </div>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      >
        Salir
      </button>
    </div>
  );
}
