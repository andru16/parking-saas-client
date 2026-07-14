import Swal from 'sweetalert2';

const primary = '#0d9488';
const primaryDark = '#0f766e';

const base = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl shadow-xl border border-slate-100 font-sans',
    title: 'text-lg font-semibold text-slate-900',
    htmlContainer: 'text-sm text-slate-600',
    confirmButton:
      'rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
    cancelButton:
      'ml-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
    denyButton:
      'ml-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
    actions: 'gap-0',
  },
  confirmButtonColor: primary,
  cancelButtonColor: '#e2e8f0',
});

export async function confirmAction(options: {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}): Promise<boolean> {
  const result = await base.fire({
    title: options.title,
    text: options.text,
    icon: options.danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Confirmar',
    cancelButtonText: options.cancelText ?? 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl shadow-xl border border-slate-100 font-sans',
      title: 'text-lg font-semibold text-slate-900',
      htmlContainer: 'text-sm text-slate-600',
      confirmButton: options.danger
        ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        : 'rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
      cancelButton:
        'ml-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50',
      actions: 'gap-0',
    },
  });

  return result.isConfirmed;
}

export async function showSuccess(title: string, text?: string) {
  await base.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: primaryDark,
  });
}

export async function showError(title: string, text?: string) {
  await base.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
  });
}

export async function showInfo(title: string, text?: string) {
  await base.fire({
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Entendido',
  });
}

/** Muestra un valor copiable (p. ej. contraseña temporal). */
export async function showSecret(title: string, secret: string, hint?: string) {
  await base.fire({
    icon: 'success',
    title,
    html: `${hint ? `<p class="mb-3 text-sm text-slate-600">${hint}</p>` : ''}<p class="rounded-lg bg-slate-100 px-3 py-2 font-mono text-base font-semibold tracking-wide text-slate-900 select-all">${secret}</p>`,
    confirmButtonText: 'Entendido',
  });
}
