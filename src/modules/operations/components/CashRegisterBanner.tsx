import { Link } from 'react-router-dom';
import { useCurrentCashRegister } from '@/modules/cash/hooks/useCashRegister';

export function CashRegisterBanner() {
  const { data: session, isLoading } = useCurrentCashRegister();

  if (isLoading) return null;

  if (session) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <span>
          Caja abierta ·{' '}
          {new Date(session.openedAt).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <Link to="/cash" className="font-medium text-emerald-700 hover:underline">
          Ver
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span>Abra la caja para operar</span>
      <Link
        to="/cash"
        className="rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
      >
        Abrir caja
      </Link>
    </div>
  );
}
