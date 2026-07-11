import type { ReactNode } from 'react';
import type { ReportFilters } from '@/api/reports';
import { useReportFilterOptions } from '@/modules/reports/hooks/useReports';

interface ReportFiltersFormProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  onSubmit: (filters: ReportFilters) => void;
  reportType?: string;
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  closed: 'Cerrado',
  cancelled: 'Anulado',
  active: 'Activo',
  inactive: 'Inactivo',
  pending_verification: 'Pendiente de verificación',
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  other: 'Otros',
  membership: 'Membresía',
};

function emptyFilters(keep?: Partial<ReportFilters>): ReportFilters {
  return { page: 1, limit: 20, ...keep };
}

export function ReportFiltersForm({
  filters,
  onChange,
  onSubmit,
  reportType = 'tickets',
}: ReportFiltersFormProps) {
  const { data: options } = useReportFilterOptions();

  const showDates = [
    'tickets',
    'payments',
    'cash-registers',
    'audit',
    'memberships',
    'membership-payments',
    'frequent-vehicles',
    'frequent-members',
  ].includes(reportType);
  const showVehicleType = ['tickets', 'vehicles'].includes(reportType);
  const showStatus = !['audit', 'payments', 'membership-payments', 'frequent-vehicles', 'frequent-members'].includes(
    reportType,
  );
  const showPaymentMethod = reportType === 'payments' || reportType === 'membership-payments';
  const showUser = ['tickets', 'payments', 'cash-registers', 'audit', 'users'].includes(reportType);
  const showMembershipScope = reportType === 'memberships';
  const statusOptions =
    reportType === 'users'
      ? options?.userStatuses
      : reportType === 'cash-registers'
        ? ['open', 'closed']
        : reportType === 'memberships' || reportType === 'members'
          ? ['active', 'inactive', 'expired']
          : options?.ticketStatuses;

  function update<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    onChange({ ...filters, [key]: value || undefined });
  }

  function handleClear() {
    const cleared = emptyFilters();
    onChange(cleared);
    onSubmit(cleared);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(filters);
      }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Filtros</h3>
          <p className="text-xs text-slate-500">Ajuste el rango y criterios antes de consultar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Consultar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {showDates && (
          <>
            <Field label="Fecha inicial">
              <input
                type="date"
                value={filters.from ?? ''}
                onChange={(e) => update('from', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Fecha final">
              <input
                type="date"
                value={filters.to ?? ''}
                onChange={(e) => update('to', e.target.value)}
                className={inputClass}
              />
            </Field>
          </>
        )}

        {showVehicleType && (
          <Field label="Tipo de vehículo">
            <select
              value={filters.vehicleCategoryId ?? ''}
              onChange={(e) => update('vehicleCategoryId', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {options?.vehicleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {showStatus && (
          <Field label="Estado">
            <select
              value={filters.status ?? ''}
              onChange={(e) => update('status', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {statusOptions?.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </Field>
        )}

        {showMembershipScope && (
          <Field label="Alcance de membresía">
            <select
              value={filters.membershipScope ?? ''}
              onChange={(e) => update('membershipScope', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {options?.membershipScopes?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        )}

        {showUser && (
          <Field label={reportType === 'audit' || reportType === 'users' ? 'Usuario' : 'Cajero'}>
            <select
              value={filters.userId ?? ''}
              onChange={(e) => update('userId', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {options?.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {showPaymentMethod && (
          <Field label="Método de pago">
            <select
              value={filters.paymentMethod ?? ''}
              onChange={(e) => update('paymentMethod', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {options?.paymentMethods.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_LABELS[m] ?? m}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
