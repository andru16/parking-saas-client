import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Pencil } from 'lucide-react';
import {
  createOrgUser,
  listOrgRoles,
  listOrgUsers,
  resetOrgUserPassword,
  updateOrgUser,
  type OrgUser,
} from '@/api/users';
import { validatePersonContactFields } from '@/lib/validation/contactFields';
import { confirmAction, showError, showSecret, showSuccess } from '@/lib/dialogs';

export function SettingsUsersPage() {
  const qc = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ['org-users'],
    queryFn: async () => (await listOrgUsers()).data.users,
  });
  const rolesQuery = useQuery({
    queryKey: ['org-roles'],
    queryFn: async () => (await listOrgRoles()).data.roles,
  });

  const [editing, setEditing] = useState<OrgUser | null>(null);
  const [creating, setCreating] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      id?: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      organizationRoleId: string;
      status?: string;
      password?: string;
    }) => {
      if (payload.id) {
        return updateOrgUser(payload.id, {
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone ?? null,
          organizationRoleId: payload.organizationRoleId,
          status: payload.status,
        });
      }
      return createOrgUser({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email!,
        phone: payload.phone,
        organizationRoleId: payload.organizationRoleId,
        password: payload.password,
        status: payload.status,
      });
    },
    onSuccess: async (res) => {
      void qc.invalidateQueries({ queryKey: ['org-users'] });
      setEditing(null);
      setCreating(false);
      const tmp = (res.data as { temporaryPassword?: string }).temporaryPassword;
      if (tmp) {
        await showSecret(
          'Usuario guardado',
          tmp,
          'Contraseña temporal generada. Copiela y entréguesela al usuario.',
        );
      } else {
        await showSuccess('Usuario guardado');
      }
    },
    onError: async (err: unknown) => {
      await showError(
        'No se pudo guardar',
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Intente de nuevo.',
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (userId: string) => resetOrgUserPassword(userId),
    onSuccess: async (res) => {
      await showSecret(
        'Contraseña restablecida',
        res.data.temporaryPassword,
        'Entregue esta contraseña temporal al usuario.',
      );
    },
    onError: async (err: unknown) => {
      await showError(
        'No se pudo restablecer',
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Intente de nuevo.',
      );
    },
  });

  const roles = rolesQuery.data ?? [];
  const users = usersQuery.data ?? [];

  async function handleResetPassword(user: OrgUser) {
    const ok = await confirmAction({
      title: '¿Restablecer contraseña?',
      text: `Se generará una contraseña temporal para ${user.firstName} ${user.lastName}.`,
      confirmText: 'Restablecer',
      danger: true,
    });
    if (ok) resetMutation.mutate(user.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-600">Administre usuarios de su parqueadero.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/settings/roles"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Gestionar roles
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
            className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Último acceso</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">{user.role?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Editar"
                      aria-label={`Editar a ${user.firstName} ${user.lastName}`}
                      className="rounded-lg p-2 text-teal-700 hover:bg-teal-50"
                      onClick={() => {
                        setEditing(user);
                        setCreating(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Restablecer contraseña"
                      aria-label={`Restablecer contraseña de ${user.firstName} ${user.lastName}`}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      disabled={resetMutation.isPending}
                      onClick={() => void handleResetPassword(user)}
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!usersQuery.isLoading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <UserFormModal
          user={editing}
          roles={roles.filter((r) => r.isActive)}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          isSaving={saveMutation.isPending}
          onSave={(payload) => saveMutation.mutate(payload)}
        />
      )}
    </div>
  );
}

function UserFormModal({
  user,
  roles,
  onClose,
  onSave,
  isSaving,
}: {
  user: OrgUser | null;
  roles: { id: string; name: string }[];
  onClose: () => void;
  isSaving: boolean;
  onSave: (payload: {
    id?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    organizationRoleId: string;
    status?: string;
    password?: string;
  }) => void;
}) {
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [roleId, setRoleId] = useState(user?.role?.id ?? roles[0]?.id ?? '');
  const [status, setStatus] = useState(user?.status === 'inactive' ? 'inactive' : 'active');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const field = 'w-full rounded-lg border px-3 py-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-lg space-y-3 rounded-xl bg-white p-5 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          const validationError = validatePersonContactFields({
            firstName,
            lastName,
            email: user ? undefined : email,
            phone,
            requireEmail: !user,
          });
          if (validationError) {
            setError(validationError);
            return;
          }
          setError(null);
          onSave({
            id: user?.id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: user ? undefined : email.trim(),
            phone: phone.trim() || undefined,
            organizationRoleId: roleId,
            status,
            password: password || undefined,
          });
        }}
      >
        <h3 className="text-lg font-semibold">{user ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className={field}
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className={field}
            placeholder="Apellidos"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        {!user && (
          <input
            className={field}
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          className={field}
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select
          className={field}
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        {!user && (
          <input
            className={field}
            type="password"
            placeholder="Contraseña (opcional — se genera temporal)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || !roleId}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
