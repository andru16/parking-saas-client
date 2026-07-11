import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TicketItem } from '@/api/tickets';
import { usePaymentMethods, useCollectTicket, useExitPreview } from '@/modules/cash/hooks/usePayments';

const lineSchema = z.object({
  method: z.string().min(1, 'Seleccione método'),
  amount: z.number().min(0),
  reference: z.string().optional(),
});

const schema = z.object({
  lines: z.array(lineSchema).min(1),
});

type FormValues = z.infer<typeof schema>;

interface CollectTicketModalProps {
  ticket: TicketItem;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CollectTicketModal({ ticket, open, onClose, onSuccess }: CollectTicketModalProps) {
  const { data: preview, isLoading: loadingPreview } = useExitPreview(ticket.id, open);
  const {
    data: methods = [],
    isLoading: loadingMethods,
    isError: methodsError,
  } = usePaymentMethods();
  const collect = useCollectTicket();
  const [error, setError] = useState<string | null>(null);

  const enabledMethods = useMemo(
    () => methods.filter((m) => m.enabled !== false && m.code !== 'membership'),
    [methods],
  );
  const defaultMethod = enabledMethods[0]?.code ?? '';

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { lines: [{ method: '', amount: 0 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = watch('lines');
  const total = preview?.total ?? 0;
  const paidSum = useMemo(
    () => lines.reduce((acc, line) => acc + (Number(line.amount) || 0), 0),
    [lines],
  );
  const remaining = total - paidSum;
  const needsPayment = Boolean(preview?.requiresPayment);
  const canCollect =
    !needsPayment || (enabledMethods.length > 0 && Math.abs(remaining) < 0.001);

  useEffect(() => {
    if (!open || !preview) return;

    if (!preview.requiresPayment) {
      reset({ lines: [{ method: 'membership', amount: 0 }] });
      return;
    }

    if (defaultMethod) {
      reset({ lines: [{ method: defaultMethod, amount: preview.total }] });
    }
  }, [open, preview, defaultMethod, reset]);

  if (!open) return null;

  async function onSubmit(values: FormValues) {
    setError(null);

    if (needsPayment && enabledMethods.length === 0) {
      setError('Configure al menos un método de pago activo en Configuración.');
      return;
    }

    if (needsPayment && Math.abs(paidSum - total) > 0.001) {
      setError(`La suma ($${paidSum}) debe coincidir con el total ($${total})`);
      return;
    }

    try {
      await collect.mutateAsync({
        ticketId: ticket.id,
        payments: needsPayment ? values.lines : [],
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo registrar el cobro';
      setError(message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-semibold text-gray-900">Cobrar ticket</h3>
            <p className="font-mono text-sm text-gray-500">{ticket.vehicle?.plate ?? '—'}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4 p-5">
          {loadingPreview ? (
            <p className="text-sm text-gray-400">Calculando...</p>
          ) : preview ? (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tiempo</span>
                <span className="font-medium">{preview.durationMinutes} min</span>
              </div>
              {preview.rateSnapshot?.billingMode && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Modalidad</span>
                  <span>{billingModeLabel(preview.rateSnapshot.billingMode)}</span>
                </div>
              )}
              {preview.coveredByMembership && preview.membership && (
                <div className="font-medium text-emerald-700">
                  Cubierto por membresía: {preview.membership.name}
                </div>
              )}
              {!preview.coveredByMembership && preview.total === 0 && (
                <div className="text-xs text-amber-700">
                  Total en $0. Si esperaba cobrar, revise la tarifa de esta categoría en
                  Configuración (puede usar precio fijo, por hora, etc.).
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                <span>Total</span>
                <span>${preview.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          ) : null}

          {needsPayment && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Método de pago</p>
                {enabledMethods.length > 0 && (
                  <button
                    type="button"
                    onClick={() => append({ method: defaultMethod, amount: 0 })}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    + Dividir pago
                  </button>
                )}
              </div>

              {loadingMethods && (
                <p className="text-sm text-gray-400">Cargando métodos de pago...</p>
              )}

              {methodsError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                  No se pudieron cargar los métodos de pago. Verifique permisos o reintente.
                </p>
              )}

              {!loadingMethods && !methodsError && enabledMethods.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  No hay métodos de pago activos.{' '}
                  <Link to="/settings/payment-methods" className="font-medium underline">
                    Configúrelos aquí
                  </Link>{' '}
                  (efectivo, Nequi, transferencia, etc.).
                </div>
              )}

              {enabledMethods.length > 0 &&
                fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                    <select
                      {...register(`lines.${index}.method`)}
                      className="col-span-5 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm"
                    >
                      <option value="">Seleccione...</option>
                      {enabledMethods.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step="100"
                      {...register(`lines.${index}.amount`, { valueAsNumber: true })}
                      className="col-span-5 rounded-lg border border-gray-300 px-2 py-2 text-sm"
                    />
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="col-span-2 py-2 text-xs text-red-600"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                ))}

              {enabledMethods.length > 0 && (
                <p className={`text-sm ${remaining === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Restante: ${remaining.toLocaleString('es-CO')}
                </p>
              )}
            </div>
          )}

          {errors.lines && (
            <p className="text-xs text-red-600">Verifique los métodos de pago</p>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={collect.isPending || loadingPreview || loadingMethods || !canCollect}
            className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {collect.isPending
              ? 'Procesando...'
              : needsPayment
                ? 'Cobrar y registrar salida'
                : 'Confirmar salida'}
          </button>
        </form>
      </div>
    </div>
  );
}

function billingModeLabel(mode: string) {
  const map: Record<string, string> = {
    fixed: 'Precio fijo',
    per_hour: 'Por hora',
    per_minute: 'Por minuto',
    hour_fraction: 'Por fracción',
    daily: 'Por día',
  };
  return map[mode] ?? mode;
}
