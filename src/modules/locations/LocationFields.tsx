import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCities, listCountries, listDepartments } from '@/api/locations';

const DEFAULT_SELECT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-600';

function normalizePlace(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase();
}

function FieldShell({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export interface LocationFieldsValue {
  country: string;
  stateOrDepartment: string;
  city: string;
}

interface LocationFieldsProps {
  value: LocationFieldsValue;
  onChange: (next: LocationFieldsValue) => void;
  errors?: Partial<Record<keyof LocationFieldsValue, string>>;
  disabled?: boolean;
  required?: Partial<Record<keyof LocationFieldsValue, boolean>>;
  selectClassName?: string;
  className?: string;
}

/**
 * Selects encadenados país → departamento → ciudad.
 * Colombia usa catálogo API; otros países usan texto libre en depto/ciudad.
 */
export function LocationFields({
  value,
  onChange,
  errors,
  disabled = false,
  required = { country: true, stateOrDepartment: true, city: true },
  selectClassName = DEFAULT_SELECT_CLASS,
  className = 'grid gap-4 md:grid-cols-3',
}: LocationFieldsProps) {
  const countriesQuery = useQuery({
    queryKey: ['locations', 'countries'],
    queryFn: listCountries,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const departmentsQuery = useQuery({
    queryKey: ['locations', 'departments', value.country || 'Colombia'],
    queryFn: () => listDepartments(value.country || 'Colombia'),
    enabled: Boolean(value.country),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const catalogDriven = departmentsQuery.data?.catalogDriven === true;
  const departments = departmentsQuery.data?.departments ?? [];

  const selectedDepartmentId = useMemo(() => {
    if (!catalogDriven || !value.stateOrDepartment) return null;
    const match = departments.find(
      (d) => normalizePlace(d.name) === normalizePlace(value.stateOrDepartment),
    );
    return match?.id ?? null;
  }, [catalogDriven, departments, value.stateOrDepartment]);

  const citiesQuery = useQuery({
    queryKey: ['locations', 'cities', selectedDepartmentId],
    queryFn: () => listCities(selectedDepartmentId!),
    enabled: catalogDriven && selectedDepartmentId != null,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const cities = citiesQuery.data ?? [];

  const [legacyCity, setLegacyCity] = useState<string | null>(null);
  const [legacyDepartment, setLegacyDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (!catalogDriven || departmentsQuery.isLoading || !value.stateOrDepartment) {
      setLegacyDepartment(null);
      return;
    }
    const exists = departments.some(
      (d) => normalizePlace(d.name) === normalizePlace(value.stateOrDepartment),
    );
    setLegacyDepartment(exists ? null : value.stateOrDepartment);
  }, [catalogDriven, departments, departmentsQuery.isLoading, value.stateOrDepartment]);

  useEffect(() => {
    if (!catalogDriven || citiesQuery.isLoading || !value.city || selectedDepartmentId == null) {
      setLegacyCity(null);
      return;
    }
    const exists = cities.some((c) => normalizePlace(c.name) === normalizePlace(value.city));
    setLegacyCity(exists ? null : value.city);
  }, [catalogDriven, cities, citiesQuery.isLoading, selectedDepartmentId, value.city]);

  function patch(partial: Partial<LocationFieldsValue>) {
    onChange({ ...value, ...partial });
  }

  const countryLabel = required.country ? 'País *' : 'País';
  const deptLabel = required.stateOrDepartment ? 'Departamento *' : 'Departamento';
  const cityLabel = required.city ? 'Ciudad *' : 'Ciudad';

  return (
    <div className={className}>
      <FieldShell label={countryLabel} error={errors?.country}>
        <select
          className={selectClassName}
          disabled={disabled || countriesQuery.isLoading}
          value={value.country}
          onChange={(e) => {
            patch({
              country: e.target.value,
              stateOrDepartment: '',
              city: '',
            });
          }}
        >
          <option value="">Seleccione país</option>
          {(countriesQuery.data ?? []).map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
          {value.country &&
            !(countriesQuery.data ?? []).some((c) => c.name === value.country) && (
              <option value={value.country}>{value.country}</option>
            )}
        </select>
      </FieldShell>

      <FieldShell label={deptLabel} error={errors?.stateOrDepartment}>
        {catalogDriven ? (
          <select
            className={selectClassName}
            disabled={disabled || !value.country || departmentsQuery.isLoading}
            value={value.stateOrDepartment}
            onChange={(e) => {
              patch({ stateOrDepartment: e.target.value, city: '' });
            }}
          >
            <option value="">
              {departmentsQuery.isLoading ? 'Cargando...' : 'Seleccione departamento'}
            </option>
            {legacyDepartment && <option value={legacyDepartment}>{legacyDepartment}</option>}
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={selectClassName}
            disabled={disabled || !value.country}
            placeholder="Departamento / estado"
            value={value.stateOrDepartment}
            onChange={(e) => patch({ stateOrDepartment: e.target.value, city: '' })}
          />
        )}
      </FieldShell>

      <FieldShell label={cityLabel} error={errors?.city}>
        {catalogDriven ? (
          <select
            className={selectClassName}
            disabled={
              disabled ||
              !value.stateOrDepartment ||
              citiesQuery.isLoading ||
              selectedDepartmentId == null
            }
            value={value.city}
            onChange={(e) => patch({ city: e.target.value })}
          >
            <option value="">
              {citiesQuery.isLoading ? 'Cargando...' : 'Seleccione ciudad'}
            </option>
            {legacyCity && <option value={legacyCity}>{legacyCity}</option>}
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={selectClassName}
            disabled={disabled || !value.country}
            placeholder="Ciudad"
            value={value.city}
            onChange={(e) => patch({ city: e.target.value })}
          />
        )}
      </FieldShell>
    </div>
  );
}
