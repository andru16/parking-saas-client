import { useState } from 'react';
import type { Member, MemberPayload } from '@/api/members';
import { useCreateMember, useUpdateMember } from '@/modules/members/hooks/useMembers';

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'OTHER', label: 'Otro' },
];

export function MemberFormModal({
  member,
  onClose,
}: {
  member?: Member | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(member);
  const create = useCreateMember();
  const update = useUpdateMember();
  const [name, setName] = useState(member?.name ?? '');
  const [documentType, setDocumentType] = useState(member?.documentType ?? 'CC');
  const [documentNumber, setDocumentNumber] = useState(member?.documentNumber ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [address, setAddress] = useState(member?.address ?? '');
  const [status, setStatus] = useState<'active' | 'inactive'>(member?.status ?? 'active');
  const [notes, setNotes] = useState(member?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;

  const buildPayload = (): MemberPayload => ({
    name: name.trim(),
    documentType,
    documentNumber: documentNumber.trim() || null,
    phone: phone.trim() || null,
    email: email.trim() || null,
    address: address.trim() || null,
    status,
    notes: notes.trim() || null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            if (isEdit && member) {
              await update.mutateAsync({ id: member._id, payload: buildPayload() });
            } else {
              await create.mutateAsync(buildPayload());
            }
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo guardar');
          }
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Editar cliente' : 'Nuevo cliente'}
        </h2>

        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre *"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Número de documento"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Dirección"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {pending ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
