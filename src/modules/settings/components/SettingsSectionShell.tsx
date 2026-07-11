import { useState, type ReactNode } from 'react';

function PencilIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    </svg>
  );
}

interface SettingsSectionShellProps {
  title: string;
  description: string;
  children: (ctx: {
    editing: boolean;
    readOnly: boolean;
    formKey: number;
    finishEditing: () => void;
    cancelEditing: () => void;
  }) => ReactNode;
}

/**
 * Contenedor de sección de configuración: vista solo lectura por defecto,
 * con icono de editar arriba a la derecha.
 */
export function SettingsSectionShell({ title, description, children }: SettingsSectionShellProps) {
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const finishEditing = () => setEditing(false);

  const cancelEditing = () => {
    setEditing(false);
    setFormKey((k) => k + 1);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Editar"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
        ) : (
          <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            Editando
          </span>
        )}
      </div>

      {children({
        editing,
        readOnly: !editing,
        formKey,
        finishEditing,
        cancelEditing,
      })}
    </div>
  );
}

export function SettingsFormActions({
  isSaving,
  onCancel,
  submitLabel = 'Guardar',
}: {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isSaving ? 'Guardando...' : submitLabel}
      </button>
    </div>
  );
}
