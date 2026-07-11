import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission } from '@/modules/auth/permissions';
import { QUICK_ACTIONS } from '@/modules/navigation/nav.config';
import { useCurrentCashRegister } from '@/modules/cash/hooks/useCashRegister';

export function QuickActions() {
  const { user } = useAuth();
  const { data: cashSession } = useCurrentCashRegister();

  const visible = QUICK_ACTIONS.filter((action) =>
    hasPermission(user?.permissions, action.permissions),
  ).filter((action) => {
    if (action.id === 'open-cash' && cashSession) return false;
    if (action.id === 'close-cash' && !cashSession) return false;
    return true;
  });

  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Accesos rápidos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {visible.map((action) => (
          <Link
            key={action.id}
            to={action.to}
            className={`rounded-2xl border px-3 py-3.5 text-center text-sm font-medium transition-colors ${
              action.tone === 'primary'
                ? 'border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100'
                : action.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
