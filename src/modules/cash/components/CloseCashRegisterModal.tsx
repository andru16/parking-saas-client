import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CashRegisterSummary } from '@/api/cashRegisters';
import { useCloseCashRegister } from '@/modules/cash/hooks/useCashRegister';
import { usePrintCash } from '@/modules/printing/hooks/usePrinting';

const schema = z.object({
  closingAmount: z.number().min(0, 'Mínimo 0'),
  notes: z.string().max(500).optional(),
  confirmed: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CloseCashRegisterModalProps {
  open: boolean;
  summary: CashRegisterSummary | undefined;
  openingAmount: number;
  onClose: () => void;
  onClosed: () => void;
}

export function CloseCashRegisterModal({
  open,
  summary,
  openingAmount,
  onClose,
  onClosed,
}: CloseCashRegisterModalProps) {
  const closeCash = useCloseCashRegister();
  const printCash = usePrintCash();
  const [step, setStep] = useState<'review' | 'confirm'>('review');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { closingAmount: 0, notes: '', confirmed: false },
  });

  if (!open) return null;

  const cashTotal = summary?.totalsByMethod?.cash ?? 0;
  const expectedCash = openingAmount + cashTotal;

  async function onSubmit(values: FormValues) {
    if (step === 'review') {
      setStep('confirm');
      setValue('confirmed', false);
      return;
    }

    try {
      const res = await closeCash.mutateAsync({
        closingAmount: values.closingAmount,
        notes: values.notes,
        confirmed: true,
      });
      const sessionId = res.data.session.id;
      void printCash.mutateAsync({ cashRegisterId: sessionId, type: 'cash_close' });
      reset();
      setStep('review');
      onClosed();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo cerrar la caja';
      setError('root', { message });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Cierre de caja</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="p-5 space-y-4">
          {step === 'review' ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <SummaryItem label="Total recaudado" value={summary?.totalCollected ?? 0} />
                <SummaryItem label="Tickets cobrados" value={summary?.ticketsPaid ?? 0} />
                <SummaryItem label="Con membresía" value={summary?.ticketsMembership ?? 0} />
                <SummaryItem label="Gratuitos" value={summary?.ticketsFree ?? 0} />
                <SummaryItem label="Efectivo esperado" value={expectedCash} highlight />
              </dl>

              <div>
                <label htmlFor="closingAmount" className="block text-sm font-medium mb-1">
                  Efectivo contado en caja
                </label>
                <input
                  id="closingAmount"
                  type="number"
                  min={0}
                  step="100"
                  {...register('closingAmount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Observaciones
                </label>
                <textarea id="notes" rows={2} {...register('notes')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
              <p className="font-semibold mb-2">¿Confirmar cierre de caja?</p>
              <p>Esta acción no se puede deshacer. Verifique que todos los tickets estén cerrados.</p>
              <label className="flex items-center gap-2 mt-3">
                <input type="checkbox" {...register('confirmed')} />
                Confirmo el cierre de caja
              </label>
              {errors.confirmed && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmed.message}</p>
              )}
            </div>
          )}

          {errors.root && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <div className="flex gap-2">
            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => setStep('review')}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium"
              >
                Volver
              </button>
            )}
            <button
              type="submit"
              disabled={closeCash.isPending}
              className="flex-1 rounded-lg bg-gray-900 text-white font-semibold py-2.5 disabled:opacity-50"
            >
              {closeCash.isPending
                ? 'Cerrando...'
                : step === 'review'
                  ? 'Continuar'
                  : 'Cerrar caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  const formatted = label.includes('efectivo') || label.includes('recaudado')
    ? `$${value.toLocaleString('es-CO')}`
    : String(value);

  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`font-semibold mt-0.5 ${highlight ? 'text-primary-700' : 'text-gray-900'}`}>
        {formatted}
      </dd>
    </div>
  );
}
