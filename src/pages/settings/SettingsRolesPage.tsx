import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import {
  createOrgRole,
  deleteOrgRole,
  duplicateOrgRole,
  getPermissionCatalog,
  listOrgRoles,
  updateOrgRole,
  type OrgRole,
} from '@/api/users';
import { confirmAction, showError, showSuccess } from '@/lib/dialogs';

export function SettingsRolesPage() {
  const qc = useQueryClient();
  const rolesQuery = useQuery({
    queryKey: ['org-roles'],
    queryFn: async () => (await listOrgRoles()).data.roles,
  });
  const catalogQuery = useQuery({
    queryKey: ['permission-catalog'],
    queryFn: async () => (await getPermissionCatalog()).data.modules,
  });

  const [editing, setEditing] = useState<OrgRole | null>(null);
  const [creating, setCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      name: string;
      description?: string;
      permissions: string[];
      isActive?: boolean;
    }) => {
      if (payload.id) {
        return updateOrgRole(payload.id, payload);
      }
      return createOrgRole(payload);
    },
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['org-roles'] });
      setEditing(null);
      setCreating(false);
      await showSuccess('Rol guardado');
    },
    onError: async (err: unknown) => {
      await showError(
        'No se pudo guardar el rol',
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Intente de nuevo.',
      );
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateOrgRole(id),
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['org-roles'] });
      await showSuccess('Rol duplicado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrgRole(id),
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: ['org-roles'] });
      await showSuccess('Rol eliminado');
    },
    onError: async (err: unknown) => {
      await showError(
        'No se pudo eliminar',
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Intente de nuevo.',
      );
    },
  });

  const roles = rolesQuery.data ?? [];
  const modules = catalogQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Roles y permisos</h2>
          <p className="text-sm text-gray-600">
            Configure roles de su organización. Los permisos se validan también en el backend.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/settings/users"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver usuarios
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white"
          >
            Nuevo rol
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {role.name}{' '}
                  {role.isSystem && (
                    <span className="text-xs font-normal text-gray-400">(sistema)</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{role.description || 'Sin descripción'}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {role.permissions.length} permisos · {role.usersCount ?? 0} usuarios ·{' '}
                  {role.isActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-1 hidden text-xs font-medium uppercase text-gray-400 sm:inline">
                  Acciones
                </span>
                <button
                  type="button"
                  title="Editar permisos"
                  aria-label={`Editar permisos de ${role.name}`}
                  className="rounded-lg p-2 text-teal-700 hover:bg-teal-50"
                  onClick={() => {
                    setEditing(role);
                    setCreating(false);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Duplicar"
                  aria-label={`Duplicar rol ${role.name}`}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  onClick={() => duplicateMutation.mutate(role.id)}
                >
                  <Copy className="h-4 w-4" />
                </button>
                {!role.isSystem && (
                  <button
                    type="button"
                    title="Eliminar"
                    aria-label={`Eliminar rol ${role.name}`}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      void (async () => {
                        const ok = await confirmAction({
                          title: '¿Eliminar este rol?',
                          text: `Se eliminará el rol “${role.name}”. Esta acción no se puede deshacer.`,
                          confirmText: 'Eliminar',
                          danger: true,
                        });
                        if (ok) deleteMutation.mutate(role.id);
                      })();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <RoleFormModal
          role={editing}
          modules={modules}
          isSaving={saveMutation.isPending}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(payload) => saveMutation.mutate(payload)}
        />
      )}
    </div>
  );
}

function RoleFormModal({
  role,
  modules,
  onClose,
  onSave,
  isSaving,
}: {
  role: OrgRole | null;
  modules: { key: string; label: string; permissions: { code: string; label: string }[] }[];
  onClose: () => void;
  isSaving: boolean;
  onSave: (payload: {
    id?: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive?: boolean;
  }) => void;
}) {
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);
  const [isActive, setIsActive] = useState(role?.isActive ?? true);

  const toggle = (code: string) => {
    setPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            id: role?.id,
            name,
            description,
            permissions,
            isActive,
          });
        }}
      >
        <div className="border-b px-5 py-4">
          <h3 className="text-lg font-semibold">{role ? 'Editar rol' : 'Nuevo rol'}</h3>
        </div>
        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Descripción"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Activo
          </label>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">Permisos por módulo</p>
            {modules.map((mod) => (
              <div key={mod.key} className="rounded-lg border border-gray-100 p-3">
                <p className="mb-2 text-sm font-semibold text-gray-800">{mod.label}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {mod.permissions.map((p) => (
                    <label key={p.code} className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={permissions.includes(p.code)}
                        onChange={() => toggle(p.code)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
