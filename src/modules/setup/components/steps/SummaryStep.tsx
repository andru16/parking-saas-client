import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '@/modules/auth/AuthProvider';
import type {
  GeneralInfoData,
  OperationalData,
  RateItem,
  VehicleCategoryItem,
} from '@/api/setup';
import { BILLING_MODES } from '../../constants';
import { useCompleteSetup, useSetupSummary } from '../../hooks/useSetup';
import { confirmAction } from '@/lib/dialogs';
import { markSetupWelcomePending } from '@/modules/setup/setupWelcome';

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer text-sm font-medium text-primary-600 hover:underline"
        >
          Editar
        </button>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  const display = value === null || value === undefined || value === '' ? '—' : String(value);
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="shrink-0 text-sm text-gray-500 sm:w-44">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{display}</dd>
    </div>
  );
}

function billingLabel(mode: string) {
  return BILLING_MODES.find((m) => m.value === mode)?.label ?? mode;
}

function formatMoney(value: number, currency = 'COP') {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString('es-CO')}`;
  }
}

function GeneralInfoSummary({ data }: { data?: GeneralInfoData }) {
  if (!data) return <p className="text-sm text-gray-500">Sin datos guardados.</p>;

  return (
    <dl className="space-y-2">
      <InfoRow label="Nombre comercial" value={data.commercialName} />
      <InfoRow label="Razón social" value={data.legalName} />
      <InfoRow label="NIT / Documento" value={data.taxId} />
      <InfoRow label="Dirección" value={data.address} />
      <InfoRow
        label="Ubicación"
        value={[data.city, data.stateOrDepartment, data.country].filter(Boolean).join(', ')}
      />
      <InfoRow label="Teléfono" value={data.phone} />
      <InfoRow label="Correo" value={data.email} />
      <InfoRow label="Zona horaria" value={data.timezone} />
      <InfoRow label="Moneda" value={data.currency} />
      <InfoRow
        label="Formatos"
        value={`${data.dateFormat || '—'} · ${data.timeFormat === '12h' ? '12 horas' : '24 horas'}`}
      />
    </dl>
  );
}

function OperationalSummary({ data }: { data?: OperationalData }) {
  if (!data) return <p className="text-sm text-gray-500">Sin datos guardados.</p>;

  return (
    <dl className="space-y-2">
      <InfoRow
        label="Horario"
        value={
          data.operate24Hours
            ? 'Opera 24 horas'
            : `${data.openTime || '—'} – ${data.closeTime || '—'}`
        }
      />
      <InfoRow label="Sobrecupo" value={data.allowOvercapacity ? 'Permitido' : 'No permitido'} />
      <InfoRow label="Tiempo de gracia" value={`${data.graceMinutes ?? 0} min`} />
      <InfoRow
        label="Plazas"
        value={data.maxCapacity != null ? String(data.maxCapacity) : 'Sin límite definido'}
      />
    </dl>
  );
}

function CategoriesSummary({
  data,
}: {
  data?: { categories?: VehicleCategoryItem[] };
}) {
  const categories = data?.categories ?? [];

  if (categories.length === 0) {
    return <p className="text-sm text-amber-700">No hay categorías configuradas.</p>;
  }

  return (
    <ul className="space-y-2">
      {categories.map((category) => (
        <li
          key={category.id ?? category.name}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <span className="text-sm font-medium text-gray-900">{category.name}</span>
            {!category.isActive && (
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                Inactiva
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {[
              category.requirements?.requiresPlate ? 'Requiere placa' : null,
              category.requirements?.requiresOwner ? 'Requiere propietario' : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Sin requisitos extra'}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RatesSummary({
  data,
  currency,
}: {
  data?: {
    rates?: RateItem[];
    categories?: Array<{ _id: string; name: string }>;
  };
  currency?: string;
}) {
  const rates = data?.rates ?? [];
  const categories = data?.categories ?? [];
  const categoryName = (id: string) =>
    categories.find((c) => String(c._id) === String(id))?.name ?? 'Categoría';

  if (rates.length === 0) {
    return <p className="text-sm text-amber-700">No hay tarifas configuradas.</p>;
  }

  return (
    <ul className="space-y-2">
      {rates.map((rate) => (
        <li
          key={rate.id ?? `${rate.vehicleCategoryId}-${rate.billingMode}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">
              {categoryName(rate.vehicleCategoryId)}
            </p>
            <p className="text-xs text-gray-500">{billingLabel(rate.billingMode)}</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatMoney(rate.value ?? 0, currency || 'COP')}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function SummaryStep({ onGoToStep }: { onGoToStep: (stepKey: string) => void }) {
  const [searchParams] = useSearchParams();
  const isReopen = searchParams.get('reopen') === '1';
  const { data, isLoading } = useSetupSummary(true);
  const completeMutation = useCompleteSetup();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const alreadyComplete = Boolean(data?.progress?.isSetupComplete);

  const handleComplete = async () => {
    if (alreadyComplete || isReopen) {
      await refreshUser();
      navigate('/dashboard', { replace: true });
      return;
    }

    const ok = await confirmAction({
      title: '¿Finalizar configuración inicial?',
      text: 'Confirme para activar su parqueadero con la información ingresada.',
      confirmText: 'Finalizar',
    });
    if (!ok) return;

    try {
      await completeMutation.mutateAsync();
      await refreshUser();
      markSetupWelcomePending();
      navigate('/bienvenida', { replace: true });
    } catch {
      // El error se muestra abajo
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const sections = (data?.sections ?? {}) as {
    general_info?: GeneralInfoData;
    operational?: OperationalData;
    vehicle_categories?: { categories?: VehicleCategoryItem[] };
    rates?: { rates?: RateItem[]; categories?: Array<{ _id: string; name: string }> };
  };

  const completeError = completeMutation.error
    ? isAxiosError(completeMutation.error)
      ? (completeMutation.error.response?.data as { message?: string })?.message ??
        completeMutation.error.message
      : (completeMutation.error as Error).message
    : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {alreadyComplete || isReopen
          ? 'Revise o edite la configuración. Los cambios de cada paso se guardan automáticamente.'
          : 'Revise la configuración antes de finalizar. Puede editar cualquier sección si necesita corregir algo.'}
      </p>

      <SectionCard title="Información general" onEdit={() => onGoToStep('general_info')}>
        <GeneralInfoSummary data={sections.general_info} />
      </SectionCard>

      <SectionCard title="Configuración operativa" onEdit={() => onGoToStep('operational')}>
        <OperationalSummary data={sections.operational} />
      </SectionCard>

      <SectionCard
        title="Categorías de vehículos"
        onEdit={() => onGoToStep('vehicle_categories')}
      >
        <CategoriesSummary data={sections.vehicle_categories} />
      </SectionCard>

      <SectionCard title="Tarifas" onEdit={() => onGoToStep('rates')}>
        <RatesSummary data={sections.rates} currency={sections.general_info?.currency} />
      </SectionCard>

      {completeError && <p className="text-sm text-red-600">{completeError}</p>}

      <button
        type="button"
        onClick={() => void handleComplete()}
        disabled={completeMutation.isPending}
        className="w-full cursor-pointer rounded-lg bg-primary-600 py-3 font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {completeMutation.isPending
          ? 'Finalizando...'
          : alreadyComplete || isReopen
            ? 'Volver al dashboard'
            : 'Finalizar configuración'}
      </button>
    </div>
  );
}
