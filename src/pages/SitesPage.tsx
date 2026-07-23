import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSite, listSites, updateSite, type SiteItem } from '@/api/sites';
import { usePlanEntitlements } from '@/modules/billing/usePlanEntitlements';
import { LocationFields } from '@/modules/locations/LocationFields';
import { showError, showSuccess } from '@/lib/dialogs';

export function SitesPage() {
  const qc = useQueryClient();
  const { limits, hasFeature } = usePlanEntitlements();
  const query = useQuery({
    queryKey: ['sites'],
    queryFn: async () => (await listSites()).data,
  });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SiteItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    stateOrDepartment: '',
    country: 'Colombia',
    status: 'active' as 'active' | 'inactive',
  });

  const sites = query.data?.sites ?? [];
  const canCreateMore = Boolean(query.data?.canCreateMore) && hasFeature('multi_site');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        status: form.status,
      };
      if (editing) return updateSite(editing.id, payload);
      return createSite(payload);
    },
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['sites'] });
      setCreating(false);
      setEditing(null);
      await showSuccess(editing ? 'Sede actualizada' : 'Sede creada');
    },
    onError: async (err: unknown) => {
      await showError(
        'No se pudo guardar',
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Intente de nuevo.',
      );
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({
      name: '',
      code: '',
      address: '',
      city: '',
      stateOrDepartment: '',
      country: 'Colombia',
      status: 'active',
    });
    setCreating(true);
  }

  function openEdit(site: SiteItem) {
    setCreating(false);
    setEditing(site);
    setForm({
      name: site.name,
      code: site.code ?? '',
      address: site.address ?? '',
      city: site.city ?? '',
      stateOrDepartment: '',
      country: 'Colombia',
      status: site.status,
    });
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sedes</h1>
          <p className="text-sm text-slate-500">
            Gestione las ubicaciones de su operación.
            {limits.maxSites != null
              ? ` Cupo del plan: ${sites.length} / ${limits.maxSites}.`
              : ' Cupo ilimitado en su plan.'}
          </p>
        </div>
        {canCreateMore && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Nueva sede
          </button>
        )}
      </div>

      {!canCreateMore && hasFeature('multi_site') === false && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Su plan no incluye multi-sede. Puede consultar la sede principal; para agregar más,
          actualice a Enterprise.
        </p>
      )}

      {query.isLoading ? (
        <p className="text-sm text-gray-400">Cargando sedes...</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((site) => (
                <tr key={site.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {site.name}
                    {site.isPrimary && (
                      <span className="ml-2 text-xs font-normal text-primary-700">Principal</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{site.code ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{site.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    {site.status === 'active' ? 'Activa' : 'Inactiva'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary-700 hover:underline"
                      onClick={() => openEdit(site)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <form
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? 'Editar sede' : 'Nueva sede'}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Nombre</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Código</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Estado</span>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={form.status}
                disabled={editing?.isPrimary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
                }
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-gray-700">Dirección</span>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </label>
          </div>

          <LocationFields
            className="grid gap-3 md:grid-cols-3"
            required={{ country: false, stateOrDepartment: false, city: false }}
            value={{
              country: form.country,
              stateOrDepartment: form.stateOrDepartment,
              city: form.city,
            }}
            onChange={(next) =>
              setForm((f) => ({
                ...f,
                country: next.country,
                stateOrDepartment: next.stateOrDepartment,
                city: next.city,
              }))
            }
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Guardar
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm text-gray-700"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
