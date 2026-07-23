import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCashPoints, useOpenCashRegister } from '@/modules/cash/hooks/useCashRegister';

const schema = z.object({
  cashPointId: z.string().optional(),
  openingAmount: z.number().min(0, 'Mínimo 0'),
  openingNotes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface OpenCashRegisterFormProps {
  onOpened?: () => void;
}

export function OpenCashRegisterForm({ onOpened }: OpenCashRegisterFormProps) {
  const { data: cashPoints = [] } = useCashPoints();
  const openCash = useOpenCashRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { openingAmount: 0, openingNotes: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await openCash.mutateAsync({
        cashPointId: values.cashPointId || undefined,
        openingAmount: values.openingAmount,
        openingNotes: values.openingNotes || undefined,
      });
      onOpened?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo abrir la caja';
      setError('root', { message });
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
      {cashPoints.length > 1 && (
        <div>
          <label htmlFor="cashPointId" className="block text-sm font-medium text-gray-700 mb-1">
            Punto de caja
          </label>
          <select
            id="cashPointId"
            {...register('cashPointId')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Seleccione punto de caja</option>
            {cashPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="openingAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Fondo inicial
        </label>
        <input
          id="openingAmount"
          type="number"
          min={0}
          step="100"
          {...register('openingAmount', { valueAsNumber: true })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {errors.openingAmount && (
          <p className="text-xs text-red-600 mt-1">{errors.openingAmount.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="openingNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          id="openingNotes"
          rows={2}
          {...register('openingNotes')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={openCash.isPending}
        className="w-full rounded-lg bg-primary-600 text-white font-semibold py-2.5 hover:bg-primary-700 disabled:opacity-50"
      >
        {openCash.isPending ? 'Abriendo...' : 'Abrir caja'}
      </button>
    </form>
  );
}
